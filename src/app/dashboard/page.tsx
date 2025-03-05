'use client';

import { Layout } from '@/components/layout/Layout';
import { useBudget } from '@/context/BudgetContext';
import { formatCurrency } from '@/utils/currency';
import { PlusCircle, TrendingUp, ArrowDownCircle, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the middleware didn't redirect (which it should), this is a backup:
    // Redirect to landing page if user is not authenticated
    if (!isLoading && !user) {
      router.push('/landing');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-sky-600 font-medium">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sky-800 mb-6">ControlCash</h1>
        
        <HomeContent />
      </div>
    </Layout>
  );
}

function HomeContent() {
  const { currentBudget, selectedCurrency, exchangeRate } = useBudget();

  // Calculate the important summary numbers
  const totalIncome = currentBudget?.incomes.reduce(
    (sum, income) => sum + (income.currency === selectedCurrency ? income.amount : 
      income.currency === 'USD' ? income.amount * exchangeRate : income.amount / exchangeRate),
    0
  ) || 0;

  const totalExpenses = currentBudget?.expenses.reduce(
    (sum, expense) => sum + (expense.currency === selectedCurrency ? expense.amount : 
      expense.currency === 'USD' ? expense.amount * exchangeRate : expense.amount / exchangeRate),
    0
  ) || 0;

  const remaining = totalIncome - totalExpenses;
  const savingsPercentage = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = currentBudget?.expenses.reduce((acc, expense) => {
    const amount = expense.currency === selectedCurrency ? expense.amount : 
      expense.currency === 'USD' ? expense.amount * exchangeRate : expense.amount / exchangeRate;
    
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>) || {};

  // Top expenses categories
  const topExpenses = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard 
          title="Ingresos Totales" 
          value={formatCurrency(totalIncome, selectedCurrency)} 
          icon={<TrendingUp className="h-8 w-8 text-green-500" />}
          color="bg-green-50 border-green-200"
        />
        <SummaryCard 
          title="Gastos Totales" 
          value={formatCurrency(totalExpenses, selectedCurrency)} 
          icon={<ArrowDownCircle className="h-8 w-8 text-red-500" />}
          color="bg-red-50 border-red-200"
        />
        <SummaryCard 
          title="Ahorro" 
          value={formatCurrency(remaining, selectedCurrency)} 
          icon={<PiggyBank className="h-8 w-8 text-sky-500" />}
          color="bg-sky-50 border-sky-200"
          subtitle={`${savingsPercentage.toFixed(1)}% de tus ingresos`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Gastos Recientes</h2>
            <Link href="/gastos" className="text-sky-600 hover:text-sky-800 text-sm flex items-center">
              Ver todos
            </Link>
          </div>
          
          {currentBudget?.expenses && currentBudget.expenses.length > 0 ? (
            <div className="space-y-4">
              {currentBudget.expenses.slice(-5).reverse().map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString('es-AR')} • {expense.category}
                    </p>
                  </div>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(expense.currency === selectedCurrency ? expense.amount : 
                      expense.currency === 'USD' ? expense.amount * exchangeRate : expense.amount / exchangeRate, 
                      selectedCurrency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No hay gastos registrados</p>
          )}
          
          <div className="mt-6">
            <Link href="/gastos/nuevo" className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded flex items-center justify-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Agregar Gasto
            </Link>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Principales Categorías</h2>
            <Link href="/estadisticas" className="text-sky-600 hover:text-sky-800 text-sm flex items-center">
              Ver estadísticas
            </Link>
          </div>
          
          {topExpenses.length > 0 ? (
            <div className="space-y-4">
              {topExpenses.map(([category, amount]) => (
                <div key={category} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 capitalize">{category}</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(amount, selectedCurrency)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-sky-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (amount / totalExpenses) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No hay categorías para mostrar</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function SummaryCard({ title, value, icon, color, subtitle }: SummaryCardProps) {
  return (
    <div className={`p-6 rounded-lg shadow-sm border ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
  );
}
