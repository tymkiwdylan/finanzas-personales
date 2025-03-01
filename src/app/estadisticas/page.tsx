'use client';

import { Layout } from '@/components/layout/Layout';
import { useBudget } from '@/context/BudgetContext';
import { formatCurrency } from '@/utils/currency';
import { useState } from 'react';

export default function Estadisticas() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sky-800 mb-6">Estadísticas</h1>
        
        <ExpenseStatistics />
      </div>
    </Layout>
  );
}

// Get current month name in Spanish
function getCurrentMonthName() {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const now = new Date();
  return monthNames[now.getMonth()];
}

function ExpenseStatistics() {
  const { currentBudget, selectedCurrency, exchangeRate } = useBudget();
  const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');
  
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter expenses by selected time frame
  const filteredExpenses = currentBudget?.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    if (timeFrame === 'month') {
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    } else {
      return expenseDate.getFullYear() === currentYear;
    }
  }) || [];
  
  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const amount = expense.currency === selectedCurrency ? expense.amount : 
      expense.currency === 'USD' ? expense.amount * exchangeRate : expense.amount / exchangeRate;
    
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort categories by amount (highest first)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1]);
    
  // Calculate total expenses
  const totalExpenses = sortedCategories.reduce((sum, [_, amount]) => sum + amount, 0);
  
  // Calculate percentages
  const categoriesWithPercentage = sortedCategories.map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
  }));
  
  // Generate random colors for categories (but consistent for each category)
  const categoryColors: Record<string, string> = {};
  const baseColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500'
  ];
  
  sortedCategories.forEach(([category], index) => {
    categoryColors[category] = baseColors[index % baseColors.length];
  });
  
  return (
    <div>
      {/* Time frame selector */}
      <div className="mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeFrame === 'month'
                ? 'bg-sky-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200`}
          >
            Mes Actual ({getCurrentMonthName()})
          </button>
          <button
            type="button"
            onClick={() => setTimeFrame('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeFrame === 'year'
                ? 'bg-sky-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200`}
          >
            Año {currentYear}
          </button>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Resumen de Gastos {timeFrame === 'month' ? `(${getCurrentMonthName()})` : `(${currentYear})`}
        </h2>
        
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg flex-1">
            <p className="text-gray-500 text-sm">Total de Gastos</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(totalExpenses, selectedCurrency)}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg flex-1">
            <p className="text-gray-500 text-sm">Categorías</p>
            <p className="text-2xl font-bold text-gray-800">
              {Object.keys(expensesByCategory).length}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg flex-1">
            <p className="text-gray-500 text-sm">Gasto promedio por categoría</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(
                Object.keys(expensesByCategory).length > 0
                  ? totalExpenses / Object.keys(expensesByCategory).length
                  : 0,
                selectedCurrency
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Gastos por Categoría
          </h2>
          
          {categoriesWithPercentage.length > 0 ? (
            <div className="space-y-4">
              {categoriesWithPercentage.map(({ category, amount, percentage }) => (
                <div key={category} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 capitalize">{category}</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(amount, selectedCurrency)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`${categoryColors[category]} h-2.5 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No hay datos para mostrar</p>
          )}
        </div>
        
        {/* Donut chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Distribución de Gastos
          </h2>
          
          {categoriesWithPercentage.length > 0 ? (
            <div className="relative">
              {/* Simple circle chart using CSS conic-gradient */}
              <div className="aspect-square w-full max-w-xs mx-auto relative mb-4">
                <div 
                  className="rounded-full h-full w-full" 
                  style={{
                    background: generateConicGradient(categoriesWithPercentage, categoryColors)
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full h-1/2 w-1/2 flex items-center justify-center">
                    <p className="text-gray-800 font-bold text-lg">
                      {formatCurrency(totalExpenses, selectedCurrency)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2">
                {categoriesWithPercentage.map(({ category, percentage }) => (
                  <div key={category} className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${categoryColors[category]} mr-2`}></div>
                    <span className="text-sm text-gray-600 capitalize">{category} ({percentage.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No hay datos para mostrar</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate conic gradient
function generateConicGradient(
  categories: { category: string; percentage: number }[],
  colors: Record<string, string>
) {
  let gradient = 'conic-gradient(';
  let currentPercentage = 0;
  
  categories.forEach(({ category, percentage }, index) => {
    // Extract the color from the Tailwind class (e.g., "bg-red-500" -> "rgb(239, 68, 68)")
    const colorClass = colors[category];
    const colorName = colorClass.replace('bg-', '');
    
    // Map Tailwind color names to approximate RGB values
    // This is a simplified mapping and not exact, but works for visualization purposes
    const colorMap: Record<string, string> = {
      'red-500': 'rgb(239, 68, 68)',
      'blue-500': 'rgb(59, 130, 246)',
      'green-500': 'rgb(34, 197, 94)',
      'yellow-500': 'rgb(234, 179, 8)',
      'purple-500': 'rgb(168, 85, 247)',
      'pink-500': 'rgb(236, 72, 153)',
      'indigo-500': 'rgb(99, 102, 241)',
      'teal-500': 'rgb(20, 184, 166)',
      'orange-500': 'rgb(249, 115, 22)',
      'cyan-500': 'rgb(6, 182, 212)',
      'lime-500': 'rgb(132, 204, 22)',
      'emerald-500': 'rgb(16, 185, 129)'
    };
    
    const color = colorMap[colorName] || 'rgb(107, 114, 128)'; // default to gray-500
    
    gradient += `${color} ${currentPercentage}% ${currentPercentage + percentage}%`;
    
    // Add comma if not the last item
    if (index < categories.length - 1) {
      gradient += ', ';
    }
    
    currentPercentage += percentage;
  });
  
  gradient += ')';
  return gradient;
}
