import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase-server';
import { stripe } from '@/utils/stripe/config';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Use the existing supabase client

    // Get Stripe customer ID for this user
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (customerError || !customerData) {
      console.error('Error retrieving Stripe customer:', customerError);
      return NextResponse.json(
        { error: 'No subscription found for this user' },
        { status: 404 }
      );
    }

    const customerId = customerData.stripe_customer_id;

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.nextUrl.origin}/perfil`,
    });

    // Return the URL to redirect to
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
