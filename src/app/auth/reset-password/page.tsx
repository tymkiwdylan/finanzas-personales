'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientBrowser } from '@/utils/supabase';

const resetSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClientBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `https://budgetcash.tech/auth/update-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar email de recuperación';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Recuperar contraseña
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tu email para recibir instrucciones de recuperación.
            </p>
          </div>

          <div className="mt-8">
            {success ? (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      ¡Email enviado!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Te hemos enviado un correo con instrucciones para recuperar tu contraseña. Por favor revisa tu bandeja de entrada.
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/auth/login"
                        className="font-medium text-sm text-green-700 hover:text-green-600"
                      >
                        Volver a inicio de sesión
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4 mb-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-70"
                    >
                      {loading ? 'Enviando...' : 'Enviar instrucciones'}
                    </button>
                  </div>
                </form>
                
                <div className="mt-4 text-center">
                  <Link
                    href="/auth/login"
                    className="font-medium text-sm text-sky-600 hover:text-sky-500"
                  >
                    Volver a inicio de sesión
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-sky-400 to-sky-600 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Mi Presupuesto Personal</h1>
        </div>
      </div>
    </div>
  );
}
