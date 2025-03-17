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

  const renderCheckMark = () => (
    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  const renderPlanFeatures = () => (
    <ul className="mt-6 space-y-4">
      <li className="flex items-center">
        {renderCheckMark()}
        <span className="text-gray-700">Gastos e ingresos ilimitados</span>
      </li>
      <li className="flex items-center">
        {renderCheckMark()}
        <span className="text-gray-700">Análisis financiero avanzado</span>
      </li>
      <li className="flex items-center">
        {renderCheckMark()}
        <span className="text-gray-700">Categorías y etiquetas personalizadas</span>
      </li>
      <li className="flex items-center">
        {renderCheckMark()}
        <span className="text-gray-700">Opciones de exportación de datos</span>
      </li>
      <li className="flex items-center">
        {renderCheckMark()}
        <span className="text-gray-700">Soporte prioritario al cliente</span>
      </li>
    </ul>
  );

  const renderSubscribeButton = (planId: string, label: string) => (
    <button
      onClick={() => handleStripeSubscribe(planId)}
      disabled={isLoading}
      className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Procesando...
        </>
      ) : (
        label
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl tracking-tight">
            Precios Simples y Transparentes
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tu viaje financiero con BudgetCash
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105 border border-gray-100 flex flex-col">
            <div className="px-6 py-8 flex-grow">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Mensual</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$6.99</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <p className="mt-2 text-gray-600">Incluye prueba gratuita de 7 días</p>
              </div>

              {renderPlanFeatures()}
            </div>

            {/* Button */}
            <div className="px-6 pb-8">
              {renderSubscribeButton('price_monthly', 'Iniciar Prueba Gratuita')}
            </div>
          </div>

          {/* Annual Plan */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 border-2 border-sky-500 flex flex-col relative">
            <div className="absolute top-0 inset-x-0 bg-sky-500 text-white text-center py-2 text-sm font-medium">
              Más Popular
            </div>
            <div className="px-6 py-12 pt-14 flex-grow">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Anual</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$69.99</span>
                  <span className="text-gray-600">/año</span>
                </div>
                <p className="mt-2 text-gray-600 font-medium">
                  <span className="text-sky-600">Ahorra $13.89</span> • $5.83/mes
                </p>
              </div>

              {renderPlanFeatures()}
            </div>

            {/* Button */}
            <div className="px-6 pb-8">
              {renderSubscribeButton('price_annual', 'Comenzar Ahora')}
            </div>
          </div>


        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-8 max-w-md mx-auto text-center text-red-600 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <p className="text-gray-600 text-lg mb-2">Garantía de satisfacción 100%</p>
          <p className="text-gray-500 text-sm">
            Todos los planes incluyen una prueba gratuita de 7 días. Cancela cuando quieras. Sin cargos ocultos. Garantía de devolución del dinero.
          </p>
        </div>
      </div>
    </div>
  );
}