import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { supabase } from '@/utils/supabase-server';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// Map price IDs to subscription tiers for easier reference
// Updated to match the IDs in checkout/route.ts
const PRICE_TO_TIER_MAP: Record<string, string> = {
  'price_1QycLQJE3OWBK5PL6VmBe6Lm': 'monthly',
  'price_1QycM0JE3OWBK5PLslLu6zhM': 'annual'
};

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionCreateOrUpdate(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await handleSubscriptionDelete(event.data.object as Stripe.Subscription);
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription as string;
            // Fetch the full subscription object to get all needed details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Inject userId from checkout session metadata into subscription metadata if available
            if (checkoutSession.metadata?.userId && !subscription.metadata?.userId) {
              console.log(`Adding userId ${checkoutSession.metadata.userId} from checkout session to subscription metadata`);
              // Make a copy of the subscription with userId in the metadata to pass to the handler
              const subscriptionWithMetadata = {
                ...subscription,
                metadata: {
                  ...subscription.metadata,
                  userId: checkoutSession.metadata.userId
                }
              };
              
              // Use the same handler as subscription.created
              await handleSubscriptionCreateOrUpdate(subscriptionWithMetadata);
            } else {
              // Use the subscription as is
              await handleSubscriptionCreateOrUpdate(subscription);
            }
          }
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    });
  }
  return new Response(JSON.stringify({ received: true }));
}

/**
 * Handle subscription creation or update events
 */
async function handleSubscriptionCreateOrUpdate(subscription: Stripe.Subscription) {
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  // Determine the tier based on the price ID
  const tier = priceId ? (PRICE_TO_TIER_MAP[priceId] || 'default') : 'default';
  
  // Set period end based on subscription data
  const periodEnd = new Date(subscription.current_period_end * 1000);
  
  console.log('Upserting subscription:', {
    id: subscription.id,
    user_id: subscription.metadata?.userId || '',
    stripe_customer_id: subscription.customer as string,
    tier: tier,
    priceId: priceId
  });
  
  if (!subscription.metadata?.userId) {
    console.error('No userId found in subscription metadata. This will likely cause the upsert to fail.');
  }
  
  // First try to find an existing subscription by user_id or stripe_customer_id
  let existingData: any = null;
  let findError: any = null;
  
  // If we have a userId in metadata, check by user_id first
  if (subscription.metadata?.userId) {
    const result = await supabase
      .from('subscriptions')
      .select('id, user_id, stripe_customer_id')
      .eq('user_id', subscription.metadata.userId)
      .maybeSingle();
    
    existingData = result.data;
    findError = result.error;
  }
  
  // If no record found by user_id or no user_id provided, try by stripe_customer_id
  if (!existingData && !findError) {
    const result = await supabase
      .from('subscriptions')
      .select('id, user_id, stripe_customer_id')
      .eq('stripe_customer_id', subscription.customer as string)
      .maybeSingle();
    
    existingData = result.data;
    findError = result.error;
  }
    
  if (findError) {
    console.error('Error finding existing subscription:', findError);
  } else {
    console.log('Existing subscription check result:', existingData || 'No existing subscription found');
  }
    
  let result: PostgrestSingleResponse<any>;
  
  if (existingData?.id) {
    console.log(`Updating existing subscription with ID: ${existingData.id}`);
    // If exists, update the existing record
    result = await supabase
      .from('subscriptions')
      .update({
        user_id: subscription.metadata?.userId || existingData.user_id, // Keep existing user_id if no new one provided
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: tier,
        subscription_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingData.id);
  } else {
    console.log('Creating new subscription record');
    // Otherwise insert a new record
    result = await supabase
      .from('subscriptions')
      .insert({
        user_id: subscription.metadata?.userId || '', // Use userId from the metadata
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_tier: tier,
        subscription_period_end: periodEnd.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  }

  if (result.error) {
    console.error('Supabase operation error:', result.error);
    throw result.error; // Re-throw so it gets caught by the outer try/catch
  } else {
    console.log('Subscription operation successful:', result.data);
  }
}

/**
 * Handle subscription deletion events
 */
async function handleSubscriptionDelete(deletedSubscription: Stripe.Subscription) {
  console.log('Processing subscription deletion:', {
    id: deletedSubscription.id,
    user_id: deletedSubscription.metadata?.userId || '',
    stripe_customer_id: deletedSubscription.customer as string
  });
  
  // For deletion, we need to be more thorough about finding the existing record
  let existingSubscription: any = null;
  
  // Try to find by subscription ID first (most reliable)
  const subByIdResult = await supabase
    .from('subscriptions')
    .select('id, user_id, stripe_customer_id')
    .eq('stripe_subscription_id', deletedSubscription.id)
    .maybeSingle();
  
  if (subByIdResult.data) {
    existingSubscription = subByIdResult.data;
  } else if (deletedSubscription.metadata?.userId) {
    // If no result by subscription ID, try by user_id
    const subByUserResult = await supabase
      .from('subscriptions')
      .select('id, user_id, stripe_customer_id')
      .eq('user_id', deletedSubscription.metadata.userId)
      .maybeSingle();
    
    if (subByUserResult.data) {
      existingSubscription = subByUserResult.data;
    }
  }
  
  // If still not found, try by customer ID
  if (!existingSubscription) {
    const subByCustomerResult = await supabase
      .from('subscriptions')
      .select('id, user_id, stripe_customer_id')
      .eq('stripe_customer_id', deletedSubscription.customer as string)
      .maybeSingle();
    
    if (subByCustomerResult.data) {
      existingSubscription = subByCustomerResult.data;
    }
  }
  
  if (existingSubscription) {
    console.log(`Found existing subscription with ID: ${existingSubscription.id} for user: ${existingSubscription.user_id}`);
    // Update the existing record to mark it as canceled
    const updateResult = await supabase
      .from('subscriptions')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSubscription.id);
    
    if (updateResult.error) {
      console.error('Error updating subscription status to canceled:', updateResult.error);
      throw updateResult.error;
    } else {
      console.log('Successfully marked subscription as canceled');
    }
  } else {
    console.error('No existing subscription found to mark as canceled. This may indicate a data consistency issue.');
  }
}