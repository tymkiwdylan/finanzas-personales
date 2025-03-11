// stripe-server.ts
'use server';

import Stripe from 'stripe';
import { supabase } from '@/utils/supabase'; // Adjust path to your Supabase client
import { stripe } from '@/utils/stripe/config'; // Adjust path to your Stripe config
import { Database } from '@/types/supabase'; // Adjust path to your updated types

type Price = Database['public']['Tables']['prices']['Row']; // Adjust if 'prices' table exists

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

/**
 * Retrieves or creates a Stripe customer ID for a Supabase user.
 * @param uuid - Supabase user ID
 * @param email - User email
 * @returns Stripe customer ID
 */
async function createOrRetrieveCustomer({ uuid, email }: { uuid: string; email: string }): Promise<string> {
  // Check if a record exists in stripe_customers for the user
  const { data, error } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', uuid)
    .single();

  if (error && error.code !== 'PGRST116') { // 'PGRST116' means no record found
    console.error('Error querying stripe_customers:', error);
    throw new Error('Error querying stripe_customers');
  }

  if (data) {
    return data.stripe_customer_id;
  }

  // If no record, check Stripe for a customer with this email
  const customers = await stripe.customers.list({ email, limit: 1 });
  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: uuid },
    });
    customerId = customer.id;
  }

  // Store the association in stripe_customers
  const { error: insertError } = await supabase
    .from('stripe_customers')
    .insert({ user_id: uuid, stripe_customer_id: customerId });

  if (insertError) {
    console.error('Error inserting into stripe_customers:', insertError);
    throw new Error('Error inserting into stripe_customers');
  }

  return customerId;
}

/**
 * Creates a Stripe checkout session.
 * @param price - Price object from Supabase
 * @param redirectPath - Path to redirect after checkout
 * @returns Checkout session ID or error redirect
 */
export async function checkoutWithStripe(
  price: Price,
  redirectPath: string = '/account'
): Promise<CheckoutResponse> {
  try {
    // Get the user from Supabase auth
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Could not get user session:', error);
      throw new Error('Could not get user session.');
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id,
        email: user.email || '',
      });
    } catch (err) {
      console.error('Unable to access customer record:', err);
      throw new Error('Unable to access customer record.');
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer,
      customer_update: {
        address: 'auto',
      },
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      cancel_url: getURL(),
      success_url: getURL(redirectPath),
    };

    if (price.type === 'recurring') {
      params = {
        ...params,
        mode: 'subscription',
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days),
        },
      };
    } else if (price.type === 'one_time') {
      params = {
        ...params,
        mode: 'payment',
      };
    }

    // Create a checkout session in Stripe
    const session = await stripe.checkout.sessions.create(params);

    if (session) {
      return { sessionId: session.id };
    } else {
      throw new Error('Unable to create checkout session.');
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('An unknown error occurred.');
    return {
      errorRedirect: getErrorRedirect(
        redirectPath,
        err.message,
        'Please try again later or contact a system administrator.'
      ),
    };
  }
}

/**
 * Creates a Stripe billing portal session.
 * @param currentPath - Current path for error redirect
 * @returns Portal URL or error redirect
 */
export async function createStripePortal(currentPath: string): Promise<string> {
  try {
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('Could not get user session:', error);
      throw new Error('Could not get user session.');
    }

    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id,
        email: user.email || '',
      });
    } catch (err) {
      console.error('Unable to access customer record:', err);
      throw new Error('Unable to access customer record.');
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: getURL('/account'),
    });

    if (!url) {
      throw new Error('Could not create billing portal');
    }

    return url;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('An unknown error occurred.');
    console.error(err);
    return getErrorRedirect(
      currentPath,
      err.message,
      'Please try again later or contact a system administrator.'
    );
  }
}

// Helper functions (placeholders - implement as needed)
function getURL(path: string = ''): string {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseURL}${path}`;
}

function getErrorRedirect(path: string, errorMessage: string, fallbackMessage: string): string {
  return `${path}?error=${encodeURIComponent(errorMessage)}&message=${encodeURIComponent(fallbackMessage)}`;
}

function calculateTrialEndUnixTimestamp(trialDays: number | null): number | undefined {
  if (!trialDays) return undefined;
  const now = new Date();
  now.setDate(now.getDate() + trialDays);
  return Math.floor(now.getTime() / 1000);
}