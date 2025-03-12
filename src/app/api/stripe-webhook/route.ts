import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { supabase } from '@/utils/supabase-server';

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
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await supabase
            .from('subscriptions')
            .upsert({
              id: subscription.id,
              user_id: subscription.metadata?.user_id || '', // Assuming user_id might be in metadata
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_tier: subscription.items.data[0]?.price.metadata?.tier || 'default', // Get tier from price metadata
              subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription as string;
            // Fetch the full subscription object to get all needed details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            await supabase
              .from('subscriptions')
              .upsert({
                id: subscriptionId,
                user_id: checkoutSession.metadata?.user_id || '', // Assuming user_id might be in metadata
                stripe_customer_id: checkoutSession.customer as string,
                stripe_subscription_id: subscriptionId,
                subscription_status: 'active',
                subscription_tier: subscription.items.data[0]?.price.metadata?.tier || 'default',
                subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
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