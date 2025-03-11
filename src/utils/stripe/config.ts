import Stripe from 'stripe';

export const stripe = new Stripe(
    "sk_test_51OgSZeJE3OWBK5PLZwoD7jlqkpSoXCCTbvNOvg46yuAGZsNaILYJH3nVdiBmLfgTyiOKgBTwuWjxMqzo3pNG2cgl007sJ606Kk",
  {
    // https://github.com/stripe/stripe-node#configuration
    // https://stripe.com/docs/api/versioning
    // @ts-ignore
    apiVersion: null,
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: 'Next.js Subscription Starter',
      version: '0.0.0',
      url: 'https://github.com/vercel/nextjs-subscription-payments'
    }
  }
);