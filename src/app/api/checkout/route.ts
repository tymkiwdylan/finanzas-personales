import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';

const PRICE_IDS = {
  "monthly": 'price_1QycLQJE3OWBK5PL6VmBe6Lm', // Legacy ID format
  "price_monthly": 'price_1QycLQJE3OWBK5PL6VmBe6Lm',
  "price_annual": 'price_1QycM0JE3OWBK5PLslLu6zhM',
  "price_lifetime": 'price_1QycMJJE3OWBK5PL2cuCwqMe'
} as const;

type PlanId = keyof typeof PRICE_IDS;

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.planId || !data.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: planId and userId are required' },
        { status: 400 }
      );
    }

    const planId = data.planId as PlanId;
    const priceId = PRICE_IDS[planId];
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid planId provided' },
        { status: 400 }
      );
    }

    const userId = data.userId as string;
    const customer = data.customer as string | undefined; // Stripe customer ID
    const coupon = data.coupon as string | null;

    const checkoutSession: Stripe.Checkout.Session =
      await stripe.checkout.sessions.create({
        ...(customer && { customer }), // Only include if customer ID exists
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        ...(coupon 
          ? { discounts: [{ coupon }] }
          : { allow_promotion_codes: true }
        ),
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            userId // Include userId in subscription metadata
          }
        },
        success_url: `${baseUrl}/dashboard`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: {
          userId,    // App-specific user ID
          priceId,   // Stripe price ID
          planId     // Plan name for reference
        }
      });

    return NextResponse.json({ 
      result: {
        id: checkoutSession.id,
        url: checkoutSession.url
      }, 
      ok: true 
    });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add request validation middleware if needed
export const config = {
  api: {
    bodyParser: true,
  },
};