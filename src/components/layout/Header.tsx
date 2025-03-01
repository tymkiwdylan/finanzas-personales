'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBudget } from '@/context/BudgetContext';
import { Currency } from '@/types';
import { Menu, X } from 'lucide-react'; 

export function Header() {
  const { selectedCurrency, setSelectedCurrency } = useBudget();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  return (
    <header className="bg-sky-700 text-white py-4 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Mi Presupuesto</Link>
        
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
          </nav>
        </div>
      )}
    </header>
  );
}
