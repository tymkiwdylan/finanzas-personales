'use client'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

async function getOrCreateCustomer(uuid: string) {
  const { data, error } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', uuid)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error querying stripe_customers:', error);
    return null;
  }
  if (data) {
    return data.stripe_customer_id;
  }
  return null;
}

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStripeSubscribe = async (priceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
      );

      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      if (!user?.id) {
        throw new Error('Please log in to subscribe');
      }

      const customerId = await getOrCreateCustomer(user.id);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: priceId,
          userId: user.id,
          customer: customerId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.result?.id) {
        throw new Error(data?.error || 'Failed to create checkout session');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.result.id
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Unlock premium features with our monthly plan
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105">
          <div className="px-6 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">Monthly Plan</h2>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="mt-2 text-gray-600">7-day free trial included</p>
            </div>

            {/* Features List */}
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Unlimited access to premium features</span>
              </li>
              <li className="flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Priority customer support</span>
              </li>
              <li className="flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Regular feature updates</span>
              </li>
            </ul>

            {/* Button */}
            <div className="mt-8">
              <button
                onClick={() => handleStripeSubscribe('monthly')}
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-gray-500 text-sm">
          Cancel anytime. No hidden fees. Money-back guarantee.
        </p>
      </div>
    </div>
  );
}