'use client';

import { Layout } from '@/components/layout/Layout';
import { useBudget } from '@/context/BudgetContext';
import { useAuth } from '@/context/AuthContext';
import { Currency, ExpenseCategory } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EditarGasto() {
  const params = useParams();
  const expenseId = params.id as string;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sky-800 mb-6">Editar Gasto</h1>
        
        <ExpenseEditForm expenseId={expenseId} />
      </div>
    </Layout>
  );
}

function ExpenseEditForm({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const { currentBudget, updateExpense } = useBudget();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    currency: 'ARS' as Currency,
    category: '',
    isRecurring: false,
    recurrenceType: 'monthly'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Common expense categories
  const categories = [
    'alquiler',
    'supermercado',
    'restaurantes',
    'transporte',
    'servicios',
    'entretenimiento',
    'salud',
    'educación',
    'ropa',
    'viajes',
    'otros'
  ];

  useEffect(() => {
    if (currentBudget && expenseId) {
      const expense = currentBudget.expenses.find(e => e.id === expenseId);
      
      if (expense) {
        setFormData({
          description: expense.description,
          amount: expense.amount.toString(),
          date: expense.date.toISOString(),
          currency: expense.currency,
          category: expense.category,
          isRecurring: expense.isRecurring || false,
          recurrenceType: expense.recurringFrequency || 'monthly'
        });
      } else {
        setNotFound(true);
      }
      
      setIsLoading(false);
    }
  }, [currentBudget, expenseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'El monto es requerido';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser un número positivo';
    }
    
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    updateExpense(expenseId, {
      description: formData.description,
      amount: Number(formData.amount),
      date: new Date(formData.date),
      currency: formData.currency,
      category: formData.category as ExpenseCategory,
      isRecurring: formData.isRecurring,
      recurringFrequency:  formData.recurrenceType as 'monthly' | 'daily' | 'weekly' | 'yearly' | undefined,
      user_id: user?.id || ''
    });
    
    router.push('/gastos');
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (notFound) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">El gasto no fue encontrado.</p>
        <button
          onClick={() => router.push('/gastos')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Volver a Gastos
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
              placeholder="Ej: Compra de supermercado"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Moneda <span className="text-red-600">*</span>
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-600">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
            >
              <option value="">Seleccione una categoría</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Is Recurring */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
              Es un gasto recurrente
            </label>
          </div>

          {/* Recurrence Type (only visible if isRecurring is true) */}
          {formData.isRecurring && (
            <div>
              <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de recurrencia
              </label>
              <select
                id="recurrenceType"
                name="recurrenceType"
                value={formData.recurrenceType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/gastos')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Actualizar
          </button>
        </div>
      </form>
    </div>
  );
}
