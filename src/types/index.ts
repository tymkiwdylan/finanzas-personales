// Currency types
export type Currency = 'ARS' | 'USD';

// Category types
export type ExpenseCategory = 
  | 'alquiler' // rent
  | 'servicios' // utilities
  | 'internet'
  | 'telefono' // phone
  | 'seguros' // insurance
  | 'suscripciones' // subscriptions
  | 'alimentos' // food
  | 'restaurantes' // restaurants
  | 'transporte' // transportation
  | 'entretenimiento' // entertainment
  | 'salud' // health
  | 'educacion' // education
  | 'vestuario' // clothing
  | 'personal' // personal care
  | 'otros'; // others

export type IncomeCategory = 
  | 'salario' // salary
  | 'freelance'
  | 'inversiones' // investments
  | 'regalo' // gift
  | 'otros'; // others

// Transaction interface
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  date: Date;
  category: ExpenseCategory | IncomeCategory;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  user_id: string;
}

// Expense and Income extend Transaction
export interface Expense extends Transaction {
  category: ExpenseCategory;
}

export interface Income extends Transaction {
  category: IncomeCategory;
}

// Monthly Budget
export interface MonthlyBudget {
  id: string;
  month: number; // 0-11
  year: number;
  expenses: Expense[];
  incomes: Income[];
  savingsGoal?: number;
  preferredCurrency: Currency;
  exchangeRate?: number; // For ARS to USD
  user_id: string;
}

// User Settings
export interface UserSettings {
  name: string;
  preferredCurrency: Currency;
  monthlyIncome?: number;
  monthlySavingsGoal?: number;
  recurringExpenses: Expense[];
  user_id: string;
}
