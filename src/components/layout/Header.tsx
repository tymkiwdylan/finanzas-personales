'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBudget } from '@/context/BudgetContext';
import { useAuth } from '@/context/AuthContext';
import { Currency } from '@/types';
import { LogOut, Menu, User, X } from 'lucide-react';
import { updateUserSettings as updateUserSettingsInDb } from '@/utils/supabase';

export function Header() {
  const { selectedCurrency, setSelectedCurrency, exchangeRate, setUserSettings } = useBudget();
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCurrencyChange = async (currency: Currency) => {
    setSelectedCurrency(currency);
    
    // Also update the user settings in the database
    try {
      await updateUserSettingsInDb({
        default_currency: currency,
        exchange_rate: exchangeRate
      });
      
      // Update the user settings in context
      setUserSettings(prev => ({
        ...prev,
        preferredCurrency: currency
      }));
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  };

  return (
    <header className="bg-sky-700 text-white py-4 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">ControlCash</Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-sky-200">Inicio</Link>
          <Link href="/gastos" className="hover:text-sky-200">Gastos</Link>
          <Link href="/ingresos" className="hover:text-sky-200">Ingresos</Link>
          <Link href="/estadisticas" className="hover:text-sky-200">Estadísticas</Link>
          <Link href="/configuracion" className="hover:text-sky-200">Configuración</Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCurrencyChange('ARS')}
              className={`px-3 py-1 rounded-l ${
                selectedCurrency === 'ARS'
                  ? 'bg-white text-sky-700'
                  : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              ARS
            </button>
            <button
              onClick={() => handleCurrencyChange('USD')}
              className={`px-3 py-1 rounded-r ${
                selectedCurrency === 'USD'
                  ? 'bg-white text-sky-700'
                  : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              USD
            </button>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse px-3 py-1 bg-sky-600 rounded">Cargando...</div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm">{user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                }}
                className="flex items-center text-sm hover:text-sky-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Salir
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded">
              Iniciar sesión
            </Link>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 px-4">
          <nav className="flex flex-col space-y-3 pt-3">
            <Link 
              href="/" 
              className="hover:text-sky-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              href="/gastos" 
              className="hover:text-sky-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gastos
            </Link>
            <Link 
              href="/ingresos" 
              className="hover:text-sky-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ingresos
            </Link>
            <Link 
              href="/estadisticas" 
              className="hover:text-sky-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Estadísticas
            </Link>
            <Link 
              href="/configuracion" 
              className="hover:text-sky-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Configuración
            </Link>
            
            <div className="flex items-center space-x-2 pb-3">
              <button
                onClick={() => {
                  handleCurrencyChange('ARS');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-l ${
                  selectedCurrency === 'ARS'
                    ? 'bg-white text-sky-700'
                    : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                ARS
              </button>
              <button
                onClick={() => {
                  handleCurrencyChange('USD');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-r ${
                  selectedCurrency === 'USD'
                    ? 'bg-white text-sky-700'
                    : 'bg-sky-600 hover:bg-sky-500'
                }`}
              >
                USD
              </button>
            </div>
            
            <div className="border-t border-sky-600 pt-3 pb-3">
              {isLoading ? (
                <div className="animate-pulse px-3 py-1 bg-sky-600 rounded">Cargando...</div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={async () => {
                      await signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center hover:text-sky-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="block px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
