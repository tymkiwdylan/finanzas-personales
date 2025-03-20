'use client';

import { Layout } from '@/components/layout/Layout';
import { useBudget } from '@/context/BudgetContext';
import { formatCurrency } from '@/utils/currency';
import { Income } from '@/types';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Ingresos() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sky-800 mb-6">Ingresos</h1>
        
        <IncomeList />
      </div>
    </Layout>
  );
}

function IncomeList() {
  const { currentBudget, selectedCurrency, exchangeRate, deleteIncome } = useBudget();
  const router = useRouter();
  
  // Get a date value for sorting, handling various date formats
  const getDateValue = (date: any): number => {
    if (date instanceof Date) {
      return date.getTime();
    } else if (typeof date === 'string') {
      return new Date(date).getTime();
    } else {
      return 0; // fallback
    }
  };

  // Log the current budget to debug
  console.log('Current budget in IncomeList:', currentBudget);
  console.log('Incomes in current budget:', currentBudget?.incomes || []);
  
  // Sort incomes by date (most recent first)
  const sortedIncomes = currentBudget?.incomes
    ? [...currentBudget.incomes].sort((a, b) => {
        // Better date handling for sorting
        return getDateValue(b.date) - getDateValue(a.date);
      })
    : [];
    
  // Calculate total incomes
  const totalIncomes = sortedIncomes.reduce(
    (sum, income) => sum + (income.currency === selectedCurrency ? income.amount : 
      income.currency === 'USD' ? income.amount * exchangeRate : income.amount / exchangeRate),
    0
  );
  
  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este ingreso?')) {
      deleteIncome(id);
    }
  };

  return (
    <div>
      {/* Add button */}
      <div className="flex justify-end mb-6">
        <Link 
          href="/ingresos/nuevo" 
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Agregar Ingreso
        </Link>
      </div>
      
      {/* Total incomes */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <div className="flex justify-between">
          <p className="text-gray-700">Total de Ingresos:</p>
          <p className="font-bold text-green-600">
            {formatCurrency(totalIncomes, selectedCurrency)}
          </p>
        </div>
      </div>
      
      {/* Incomes Table/Cards */}
      <div className="bg-white shadow overflow-hidden rounded-lg border">
        {sortedIncomes.length > 0 ? (
          <>
            {/* Table for medium and large screens */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedIncomes.map((income: Income) => (
                    <tr key={income.id} className={`hover:bg-gray-50 ${income.isRecurring ? 'bg-green-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(income.date).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {income.description}
                        {income.isRecurring && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Recurrente {income.recurringFrequency === 'daily' ? 'diario' : 
                                        income.recurringFrequency === 'weekly' ? 'semanal' : 
                                        income.recurringFrequency === 'monthly' ? 'mensual' : 
                                        income.recurringFrequency === 'yearly' ? 'anual' : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(
                          income.currency === selectedCurrency 
                            ? income.amount 
                            : income.currency === 'USD' 
                                ? income.amount * exchangeRate 
                                : income.amount / exchangeRate,
                          selectedCurrency
                        )}
                        {income.currency !== selectedCurrency && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({formatCurrency(income.amount, income.currency)})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/ingresos/editar/${income.id}`)}
                            className="text-sky-600 hover:text-sky-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(income.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Cards for small screens */}
            <div className="sm:hidden divide-y divide-gray-200">
              {sortedIncomes.map((income: Income) => (
                <div key={income.id} className={`p-4 ${income.isRecurring ? 'bg-green-50' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{income.description}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/ingresos/editar/${income.id}`)}
                        className="text-sky-600 hover:text-sky-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {income.isRecurring && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Recurrente {income.recurringFrequency === 'daily' ? 'diario' : 
                                    income.recurringFrequency === 'weekly' ? 'semanal' : 
                                    income.recurringFrequency === 'monthly' ? 'mensual' : 
                                    income.recurringFrequency === 'yearly' ? 'anual' : ''}
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <p className="font-medium">{new Date(income.date).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monto</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(
                          income.currency === selectedCurrency 
                            ? income.amount 
                            : income.currency === 'USD' 
                                ? income.amount * exchangeRate 
                                : income.amount / exchangeRate,
                          selectedCurrency
                        )}
                        {income.currency !== selectedCurrency && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({formatCurrency(income.amount, income.currency)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No hay ingresos registrados.
          </div>
        )}
      </div>
    </div>
  );
}
