'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClientBrowser } from '@/utils/supabase';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';

const profileSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido').optional(),
  currentPassword: z.string().min(1, 'La contraseña actual es requerida').optional(),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres').optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // If newPassword is provided, confirmPassword must match
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Redirect if not logged in
  if (!isLoading && !user) {
    router.push('/auth/login');
    return null;
  }
  
  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const supabase = createClientBrowser();
      
      if (data.newPassword && data.currentPassword) {
        // Update password
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword,
        });
        
        if (error) {
          throw error;
        }
        
        setSuccess('Tu contraseña ha sido actualizada');
      }
      
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 md:p-8">
          <div className="flex items-center mb-8">
            <div className="bg-sky-100 p-3 rounded-full">
              <User className="h-8 w-8 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold ml-4">Perfil de Usuario</h1>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
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
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  defaultValue={user?.email || ''}
                />
                <p className="mt-1 text-xs text-gray-500">El email no se puede cambiar</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cambiar contraseña</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Contraseña actual
                  </label>
                  <div className="mt-1">
                    <input
                      id="currentPassword"
                      type="password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                      {...register('currentPassword')}
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nueva contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="newPassword"
                      type="password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                      {...register('newPassword')}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar nueva contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      type="password"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
