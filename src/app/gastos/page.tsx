'use client';

import { Layout } from '@/components/layout/Layout';
import { useBudget } from '@/context/BudgetContext';
import { formatCurrency } from '@/utils/currency';
import { Expense } from '@/types';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Gastos() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sky-800 mb-6">Gastos</h1>
        
        <ExpensesList />
      </div>
    </Layout>
  );
}

function ExpensesList() {
  const { currentBudget, selectedCurrency, exchangeRate, deleteExpense } = useBudget();
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  
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
  console.log('Current budget in ExpensesList:', currentBudget);
  console.log('Expenses in current budget:', currentBudget?.expenses || []);
  
  // Sort expenses by date (most recent first)
  const sortedExpenses = currentBudget?.expenses
    ? [...currentBudget.expenses].sort((a, b) => {
        // Better date handling for sorting
        return getDateValue(b.date) - getDateValue(a.date);
      })
    : [];
    
  const filteredExpenses = filterCategory 
    ? sortedExpenses.filter(expense => expense.category === filterCategory)
    : sortedExpenses;
    
  // Get unique categories from expenses
  const categories = [...new Set(sortedExpenses.map(expense => expense.category))];
  
  // Calculate total for filtered expenses
  const totalFiltered = filteredExpenses.reduce(
    (sum, expense) => sum + (expense.currency === selectedCurrency ? expense.amount : 
      expense.currency === 'USD' ? expense.amount * exchangeRate : expense.amount / exchangeRate),
    0
  );
  
  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este gasto?')) {
      deleteExpense(id);
    }
  };

  return (
    <div>
      {/* Filters and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por categoría
          </label>
          <select
            id="categoryFilter"
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <Link 
          href="/gastos/nuevo" 
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded flex items-center justify-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Agregar Gasto
        </Link>
      </div>
      
      {/* Total for filtered expenses */}
      <div className="bg-sky-50 border border-sky-200 rounded-md p-4 mb-6">
        <div className="flex justify-between">
          <p className="text-gray-700">Total {filterCategory ? `(${filterCategory})` : ''}:</p>
          <p className="font-bold text-red-600">
            {formatCurrency(totalFiltered, selectedCurrency)}
          </p>
        </div>
      </div>
      
      {/* Expenses Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg border">
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
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
                    Categoría
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
                {filteredExpenses.map((expense: Expense) => (
                  <tr key={expense.id} className={`hover:bg-gray-50 ${expense.isRecurring ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.description}
                      {expense.isRecurring && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Recurrente {expense.recurringFrequency === 'daily' ? 'diario' : 
                                      expense.recurringFrequency === 'weekly' ? 'semanal' : 
                                      expense.recurringFrequency === 'monthly' ? 'mensual' : 
                                      expense.recurringFrequency === 'yearly' ? 'anual' : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatCurrency(
                        expense.currency === selectedCurrency 
                          ? expense.amount 
                          : expense.currency === 'USD' 
                              ? expense.amount * exchangeRate 
                              : expense.amount / exchangeRate,
                        selectedCurrency
                      )}
                      {expense.currency !== selectedCurrency && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({formatCurrency(expense.amount, expense.currency)})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/gastos/editar/${expense.id}`)}
                          className="text-sky-600 hover:text-sky-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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
        ) : (
          <div className="p-8 text-center text-gray-500">
            No hay gastos {filterCategory ? `en la categoría ${filterCategory}` : 'registrados'}.
          </div>
        )}
      </div>
    </div>
  );
}
