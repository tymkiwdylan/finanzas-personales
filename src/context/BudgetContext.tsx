'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Currency, MonthlyBudget, Expense, Income, UserSettings, IncomeCategory } from '@/types';
import { getExchangeRate } from '@/utils/currency';
import {
  supabase,
  fetchExpenses,
  addExpenseToDb,
  updateExpenseInDb,
  deleteExpenseFromDb,
  fetchIncomes,
  addIncomeToDb,
  updateIncomeInDb,
  deleteIncomeFromDb,
  fetchUserSettings,
  updateUserSettings as updateUserSettingsInDb,
  getCurrentUserId
} from '@/utils/supabase';
import { useAuth } from './AuthContext';

type BudgetContextType = {
  currentBudget: MonthlyBudget | null;
  allBudgets: MonthlyBudget[];
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  exchangeRate: number;
  selectedCurrency: Currency;
  isLoading: boolean;
  error: string | null;
  setSelectedCurrency: (currency: Currency) => void;
  updateExchangeRate: (rate: number) => void;
  addExpense: (expense: Omit<Expense, 'id'> & { [key: string]: any }) => Promise<void>;
  addIncome: (income: Omit<Income, 'id'> & { [key: string]: any }) => Promise<void>;
  updateExpense: (id: string, expense: Omit<Expense, 'id'> & { [key: string]: any }) => Promise<void>;
  updateIncome: (id: string, income: Omit<Income, 'id'> & { [key: string]: any }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  exportData: () => any;
  importData: (data: any) => Promise<void>;
};

const defaultUserSettings: UserSettings = {
  name: 'Usuario',
  preferredCurrency: 'ARS',
  recurringExpenses: [],
  user_id: '', // This will be set properly in the component
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [allBudgets, setAllBudgets] = useState<MonthlyBudget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('ARS');
  const [exchangeRate, setExchangeRate] = useState<number>(1000); // Default rate
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format date for display
  const formatDateDisplay = (date: Date | string): string => {
    if (!date) return '';
    
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for display:', error, date);
      return '';
    }
  };

  // Group expenses and incomes by month
  const groupByMonth = async (expenses: Expense[], incomes: Income[]) => {
    const budgetsByMonthYear: Record<string, MonthlyBudget> = {};
    let userId = '';
    
    try {
      userId = await getCurrentUserId();
    } catch (error) {
      console.error('Error getting user ID for budgets:', error);
      // If we can't get the user ID, we'll use an empty string
      // This should only happen if the user is not authenticated
    }
    
    // Process expenses
    expenses.forEach(expense => {
      const month = expense.date.getMonth();
      const year = expense.date.getFullYear();
      const key = `${month}-${year}`;
      
      if (!budgetsByMonthYear[key]) {
        budgetsByMonthYear[key] = {
          id: uuidv4(),
          month,
          year,
          expenses: [],
          incomes: [],
          preferredCurrency: userSettings.preferredCurrency,
          exchangeRate,
          user_id: userId,
        };
      }
      
      budgetsByMonthYear[key].expenses.push(expense);
    });
    
    // Process incomes
    incomes.forEach(income => {
      const month = income.date.getMonth();
      const year = income.date.getFullYear();
      const key = `${month}-${year}`;
      
      if (!budgetsByMonthYear[key]) {
        budgetsByMonthYear[key] = {
          id: uuidv4(),
          month,
          year,
          expenses: [],
          incomes: [],
          preferredCurrency: userSettings.preferredCurrency,
          exchangeRate,
          user_id: userId,
        };
      }
      
      budgetsByMonthYear[key].incomes.push(income);
    });
    
    return budgetsByMonthYear;
  };

  // Load data from database function declaration has been moved above the useEffect

  // Initialize data on component mount
  // Define loadData outside useEffect to avoid dependency issues
  const loadData = async () => {
    // Don't load data if user is not authenticated
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Fetch expenses and incomes from database - these now filter by user_id
      const expenses = await fetchExpenses();
      const incomes = await fetchIncomes();

      console.log(expenses, incomes)
      
      // Process expenses and incomes to match our app format
      console.log('Raw expenses from DB:', expenses);
      const processedExpenses = expenses.map((exp: any) => {
        // Ensure we create a proper date object
        let expDate;
        try {
          expDate = new Date(exp.date);
          if (isNaN(expDate.getTime())) {
            console.error(`Invalid date for expense: ${exp.date}, using current date`);
            expDate = new Date();
          }
        } catch (err) {
          console.error(`Error parsing date for expense: ${exp.date}`, err);
          expDate = new Date();
        }
        
        return {
          id: exp.id,
          description: exp.description,
          amount: exp.amount,
          date: expDate,
          currency: exp.currency || 'ARS',
          category: exp.category || 'otros',
          isRecurring: exp.is_recurring || false,
          recurringFrequency: exp.recurring_frequency || undefined,
          user_id: exp.user_id
        };
      });
      
      const processedIncomes = incomes.map((inc: any) => {
        // Ensure we create a proper date object
        let incDate;
        try {
          incDate = new Date(inc.date);
          if (isNaN(incDate.getTime())) {
            console.error(`Invalid date for income: ${inc.date}, using current date`);
            incDate = new Date();
          }
        } catch (err) {
          console.error(`Error parsing date for income: ${inc.date}`, err);
          incDate = new Date();
        }
        
        return {
          id: inc.id,
          description: inc.description,
          amount: inc.amount,
          date: incDate,
          currency: inc.currency || 'ARS',
          category: inc.category || 'otros',
          isRecurring: inc.is_recurring || false,
          recurringFrequency: inc.recurring_frequency || undefined,
          user_id: inc.user_id
        };
      });
      
      // Group expenses and incomes by month
      const groupedBudgets = await groupByMonth(processedExpenses, processedIncomes);
      
      // Set all budgets
      setAllBudgets(Object.values(groupedBudgets));
      
      // Set current budget to the one for the current month
      const today = new Date();
      const currentMonthYear = `${today.getMonth()}-${today.getFullYear()}`;
      
      if (groupedBudgets[currentMonthYear]) {
        setCurrentBudget(groupedBudgets[currentMonthYear]);
      } else {
        // Create a new budget for the current month
        const newBudget: MonthlyBudget = {
          id: uuidv4(),
          month: today.getMonth(),
          year: today.getFullYear(),
          expenses: [],
          incomes: [],
          preferredCurrency: userSettings.preferredCurrency,
          exchangeRate,
          user_id: user?.id || '',
        };
        
        setCurrentBudget(newBudget);
        setAllBudgets(prev => [...prev, newBudget]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      // Don't initialize if user is not authenticated
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current user's ID
        const userId = user.id;
        
        // Fetch user settings from database - now filtered by user_id
        const settings = await fetchUserSettings();
        if (settings) {
          setUserSettings({
            name: settings.default_currency === 'ARS' ? 'Usuario' : 'User',
            preferredCurrency: settings.default_currency as Currency,
            recurringExpenses: [],
            user_id: userId
          });
          setSelectedCurrency(settings.default_currency as Currency);
          setExchangeRate(settings.exchange_rate);
        } else {
          // If no settings, fetch exchange rate and create default settings
          const rate = await getExchangeRate();
          setExchangeRate(rate);
          
          // Create user settings with current user's ID
          await updateUserSettingsInDb({
            default_currency: 'ARS',
            exchange_rate: rate
          });
        }
        
        // Fetch expenses and incomes
        await loadData();
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Error al cargar los datos iniciales');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) { // Only initialize after auth is loaded
      initializeData();
    }
    
    // Set up exchange rate refresh every hour
    const interval = setInterval(async () => {
      if (user) { // Only refresh if user is authenticated
        try {
          const rate = await getExchangeRate();
          setExchangeRate(rate);
          
          // Also update in database
          await updateUserSettingsInDb({
            exchange_rate: rate
          });
        } catch (error) {
          console.error('Error refreshing exchange rate:', error);
        }
      }
    }, 3600000);
    
    return () => clearInterval(interval);
  }, [user, authLoading]); // Depend on user and auth loading state
  
  // Create a new budget if none exists for current month
  useEffect(() => {
    if (!isLoading && !currentBudget) {
      const today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      
      const existingBudget = allBudgets.find(
        (budget) => budget.month === month && budget.year === year
      );
      
      if (existingBudget) {
        setCurrentBudget(existingBudget);
      } else {
        const newBudget: MonthlyBudget = {
          id: uuidv4(),
          month,
          year,
          expenses: [],
          incomes: [],
          preferredCurrency: userSettings.preferredCurrency,
          exchangeRate,
          user_id: user?.id || '',
        };
        
        setCurrentBudget(newBudget);
        setAllBudgets((prev) => [...prev, newBudget]);
      }
    }
  }, [allBudgets, currentBudget, exchangeRate, isLoading, userSettings.preferredCurrency]);

  // Convert Date to ISO string for database
  const formatDateForDb = (date: Date | string): string => {
    console.log('Formatting date for DB:', date, 'Type:', typeof date);
    
    if (!date) {
      console.error('Null or undefined date provided to formatDateForDb');
      return new Date().toISOString().split('T')[0]; // Use current date as fallback
    }
    
    // Handle Date objects
    if (date instanceof Date) {
      try {
        if (isNaN(date.getTime())) {
          console.error('Invalid Date object provided:', date);
          return new Date().toISOString().split('T')[0]; // Use current date as fallback
        }
        const formatted = date.toISOString().split('T')[0];
        console.log('Formatted Date object to:', formatted);
        return formatted;
      } catch (e) {
        console.error('Error formatting Date object:', e, date);
        return new Date().toISOString().split('T')[0]; // Use current date as fallback
      }
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      // If already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.log('Date is already in YYYY-MM-DD format:', date);
        return date;
      }
      
      // Try to convert to a Date object and then format
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          console.error('Invalid date string provided:', date);
          return new Date().toISOString().split('T')[0]; // Use current date as fallback
        }
        const formatted = dateObj.toISOString().split('T')[0];
        console.log('Converted string date to formatted date:', formatted);
        return formatted;
      } catch (e) {
        console.error('Error converting string date:', e, date);
        return new Date().toISOString().split('T')[0]; // Use current date as fallback
      }
    }
    
    // If we somehow got here with an unexpected type
    console.error('Unexpected date type:', typeof date, date);
    return new Date().toISOString().split('T')[0]; // Use current date as fallback
  };

  // Convert data for database
  const prepareExpenseForDb = (expense: Expense | Omit<Expense, 'id'> & { [key: string]: any }) => {
    console.log('Preparing expense for DB:', expense);
    
    // Ensure date is valid
    if (!expense.date) {
      console.error('Missing date in expense object:', expense);
      expense.date = new Date(); // Use current date as fallback
    }
    
    const prepared = {
      description: expense.description,
      amount: expense.amount,
      date: formatDateForDb(expense.date),
      currency: expense.currency,
      category: expense.category,
      is_recurring: expense.isRecurring || false,
      recurring_frequency: expense.isRecurring ? expense.recurringFrequency : null
    };
    console.log('Prepared expense for DB:', prepared);
    return prepared;
  };

  const prepareIncomeForDb = (income: Income | Omit<Income, 'id'> & { [key: string]: any }) => {
    console.log('Preparing income for DB:', income);
    // Ensure income properties exist and are in the right format
    if (!income.date) {
      console.error('Missing date in income object:', income);
      income.date = new Date(); // Use current date as fallback
    }
    
    // Ensure we're using a valid Date object
    let dateValue: Date | string = income.date;
    if (typeof income.date === 'string') {
      try {
        const dateObj = new Date(income.date);
        if (!isNaN(dateObj.getTime())) {
          dateValue = dateObj;
        }
      } catch (e) {
        console.error('Error parsing date string:', e);
        dateValue = new Date(); // Use current date as fallback
      }
    }
    
    const prepared = {
      description: income.description,
      amount: income.amount,
      date: formatDateForDb(dateValue),
      currency: income.currency,
      category: income.category,
      is_recurring: income.isRecurring || false,
      recurring_frequency: income.isRecurring ? income.recurringFrequency : null
    };
    console.log('Prepared income for DB:', prepared);
    return prepared;
  };

  // Add a new expense
  const addExpense = async (expense: Omit<Expense, 'id'> & { [key: string]: any }) => {
    if (!currentBudget) throw new Error('No hay un presupuesto activo');
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Log input data for debugging
      console.log('Adding expense with data:', expense);
      
      // Add to database
      const dbExpense = await addExpenseToDb(prepareExpenseForDb(expense));
      
      console.log('Response from addExpenseToDb:', dbExpense);
      
      // Create expense object for UI
      const newExpense: Expense = {
        ...expense,
        id: dbExpense.id,
      };
      
      console.log('New expense object created:', newExpense);
      
      // Update local state
      const updatedBudget = {
        ...currentBudget,
        expenses: [...currentBudget.expenses, newExpense],
      };
      
      setCurrentBudget(updatedBudget);
      
      setAllBudgets((prev) =>
        prev.map((budget) =>
          budget.id === currentBudget.id ? updatedBudget : budget
        )
      );
      
      // No need to reload data here, we've already updated local state
      console.log('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Error al añadir el gasto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new income
  const addIncome = async (income: Omit<Income, 'id'> & { [key: string]: any }) => {
    if (!currentBudget) throw new Error('No hay un presupuesto activo');
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Log input data for debugging
      console.log('Adding income with data:', income);
      
      // Add to database
      const dbIncome = await addIncomeToDb(prepareIncomeForDb(income));
      
      console.log('Response from addIncomeToDb:', dbIncome);
      
      // Create income object for UI - use the original income object with ID for consistency
      const newIncome: Income = {
        ...income,
        id: dbIncome.id,
      };
      
      console.log('New income object created:', newIncome);
      
      // Update local state
      const updatedBudget = {
        ...currentBudget,
        incomes: [...currentBudget.incomes, newIncome],
      };
      
      setCurrentBudget(updatedBudget);
      
      setAllBudgets((prev) =>
        prev.map((budget) =>
          budget.id === currentBudget.id ? updatedBudget : budget
        )
      );
      
      // No need to reload data here, we've already updated local state
      console.log('Income added successfully');
    } catch (error) {
      console.error('Error adding income:', error);
      setError('Error al añadir el ingreso');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing expense
  const updateExpense = async (id: string, expense: Omit<Expense, 'id'> & { [key: string]: any }) => {
    if (!currentBudget) throw new Error('No hay un presupuesto activo');
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Update in database
      await updateExpenseInDb(id, prepareExpenseForDb(expense));
      
      // Update local state
      const updatedExpenses = currentBudget.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...expense } : exp
      );
      
      const updatedBudget = {
        ...currentBudget,
        expenses: updatedExpenses,
      };
      
      setCurrentBudget(updatedBudget);
      
      setAllBudgets((prev) =>
        prev.map((budget) =>
          budget.id === currentBudget.id ? updatedBudget : budget
        )
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      setError('Error al actualizar el gasto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing income
  const updateIncome = async (id: string, income: Omit<Income, 'id'> & { [key: string]: any }) => {
    if (!currentBudget) throw new Error('No hay un presupuesto activo');
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Update in database
      await updateIncomeInDb(id, prepareIncomeForDb(income));
      
      // Update local state
      const updatedIncomes = currentBudget.incomes.map((inc) =>
        inc.id === id ? { ...inc, ...income } : inc
      );
      
      const updatedBudget = {
        ...currentBudget,
        incomes: updatedIncomes,
      };
      
      setCurrentBudget(updatedBudget);
      
      setAllBudgets((prev) =>
        prev.map((budget) =>
          budget.id === currentBudget.id ? updatedBudget : budget
        )
      );
    } catch (error) {
      console.error('Error updating income:', error);
      setError('Error al actualizar el ingreso');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string) => {
    if (!currentBudget) throw new Error('No hay un presupuesto activo');
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Delete from database
      await deleteExpenseFromDb(id);
      
      // Update local state
      const updatedExpenses = currentBudget.expenses.filter((exp) => exp.id !== id);
      
      const updatedBudget = {
        ...currentBudget,
        expenses: updatedExpenses,
      };
      
      setCurrentBudget(updatedBudget);
      
      setAllBudgets((prev) =>
        prev.map((budget) =>
          budget.id === currentBudget.id ? updatedBudget : budget
        )
      );
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Error al eliminar el gasto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an income
  const deleteIncome = async (id: string) => {
    if (!currentBudget) throw new Error('No hay un presupuesto activo');
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Delete from database
      await deleteIncomeFromDb(id);
      
      // Update local state
      const updatedIncomes = currentBudget.incomes.filter((inc) => inc.id !== id);
      
      const updatedBudget = {
        ...currentBudget,
        incomes: updatedIncomes,
      };
      
      setCurrentBudget(updatedBudget);
      
      setAllBudgets((prev) =>
        prev.map((budget) =>
          budget.id === currentBudget.id ? updatedBudget : budget
        )
      );
    } catch (error) {
      console.error('Error deleting income:', error);
      setError('Error al eliminar el ingreso');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update exchange rate - helper function for settings page
  const updateExchangeRate = async (rate: number) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Update in database
      await updateUserSettingsInDb({
        exchange_rate: rate
      });
      
      // Update local state
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      setError('Error al actualizar el tipo de cambio');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user settings
  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Update in database
      await updateUserSettingsInDb({
        default_currency: settings.preferredCurrency || userSettings.preferredCurrency,
        exchange_rate: exchangeRate
      });
      
      // Update local state
      setUserSettings((prev) => {
        const updated = { ...prev, ...settings };
        return updated;
      });
      
      if (settings.preferredCurrency) {
        setSelectedCurrency(settings.preferredCurrency);
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      setError('Error al actualizar la configuración');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Export data for backup
  const exportData = () => {
    return {
      budgets: allBudgets,
      settings: userSettings,
      version: '1.0.0'
    };
  };

  // Import data from backup
  const importData = async (data: any) => {
    setError(null);
    setIsLoading(true);
    
    try {
      if (!data || !data.budgets || !data.settings) {
        throw new Error('Invalid data format');
      }
      
      // Import expenses and incomes
      if (data.budgets.length > 0) {
        const allExpenses = [];
        const allIncomes = [];
        
        // Extract all expenses and incomes from all budgets
        for (const budget of data.budgets) {
          allExpenses.push(...budget.expenses.map((exp: Expense) => ({
            ...prepareExpenseForDb(exp),
            id: exp.id
          })));
          
          allIncomes.push(...budget.incomes.map((inc: Income) => ({
            ...prepareIncomeForDb(inc),
            id: inc.id
          })));
        }
        
        // Delete all existing data
        // (In a real app, you'd want to add confirmation and transaction support)
        const { data: existingExpenses } = await supabase.from('expenses').select('id');
        if (existingExpenses && existingExpenses.length > 0) {
          await supabase.from('expenses').delete().in('id', existingExpenses.map(e => e.id));
        }
        
        const { data: existingIncomes } = await supabase.from('incomes').select('id');
        if (existingIncomes && existingIncomes.length > 0) {
          await supabase.from('incomes').delete().in('id', existingIncomes.map(i => i.id));
        }
        
        // Insert all imported data
        if (allExpenses.length > 0) {
          await supabase.from('expenses').insert(allExpenses);
        }
        
        if (allIncomes.length > 0) {
          await supabase.from('incomes').insert(allIncomes);
        }
      }
      
      // Update settings
      await updateUserSettingsInDb({
        default_currency: data.settings.preferredCurrency,
        exchange_rate: exchangeRate
      });
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('Error importing data:', error);
      setError('Error al importar los datos');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process recurring expenses and generate future entries
  const processRecurringExpenses = (expenses: Expense[]): Expense[] => {
    console.log('Processing recurring expenses...');
    const today = new Date();
    const futureExpenses: Expense[] = [];
    
    // Look for recurring expenses
    expenses.forEach(expense => {
      if (!expense.isRecurring) return;
      
      console.log(`Processing recurring expense: ${expense.description} with frequency ${expense.recurringFrequency}`);
      
      // Calculate how many future entries to generate
      // We'll generate entries for the next 12 months for monthly, 1 year for weekly/daily, and 5 years for yearly
      const expenseDate = new Date(expense.date);
      // const futureDate = new Date(today); // Not used
      const iterations = {
        daily: 30, // Next 30 days
        weekly: 12, // Next 12 weeks
        monthly: 12, // Next 12 months
        yearly: 5 // Next 5 years
      };
      
      const iterationCount = iterations[expense.recurringFrequency as keyof typeof iterations];
      
      // Generate future instances starting from the next occurrence
      for (let i = 1; i <= iterationCount; i++) {
        // Clone the original expense
        const futureExpense: Expense = {
          ...expense,
          id: uuidv4() // Generate a new ID for this instance
        };
        
        // Calculate next date based on recurrence pattern
        const nextDate = new Date(expenseDate);
        
        if (expense.recurringFrequency === 'daily') {
          nextDate.setDate(expenseDate.getDate() + i);
        } else if (expense.recurringFrequency === 'weekly') {
          nextDate.setDate(expenseDate.getDate() + (i * 7));
        } else if (expense.recurringFrequency === 'monthly') {
          nextDate.setMonth(expenseDate.getMonth() + i);
        } else if (expense.recurringFrequency === 'yearly') {
          nextDate.setFullYear(expenseDate.getFullYear() + i);
        }
        
        // Only include future expenses
        if (nextDate > today) {
          futureExpense.date = nextDate;
          futureExpense.description = `${expense.description} (Recurrente)`;
          futureExpenses.push(futureExpense);
          console.log(`Generated future expense: ${futureExpense.description} for ${nextDate.toLocaleDateString()}`);
        }
      }
    });
    
    console.log(`Generated ${futureExpenses.length} future recurring expenses`);
    return [...expenses, ...futureExpenses];
  };
  
  // Process recurring incomes and generate future entries
  const processRecurringIncomes = (incomes: Income[]): Income[] => {
    console.log('Processing recurring incomes...');
    const today = new Date();
    const futureIncomes: Income[] = [];
    
    // Look for recurring incomes
    incomes.forEach(income => {
      if (!income.isRecurring) return;
      
      console.log(`Processing recurring income: ${income.description} with frequency ${income.recurringFrequency}`);
      
      // Calculate how many future entries to generate
      const incomeDate = new Date(income.date);
      // const futureDate = new Date(today); // Not used
      const iterations = {
        daily: 30, // Next 30 days
        weekly: 12, // Next 12 weeks
        monthly: 12, // Next 12 months
        yearly: 5 // Next 5 years
      };
      
      const iterationCount = iterations[income.recurringFrequency as keyof typeof iterations];
      
      // Generate future instances starting from the next occurrence
      for (let i = 1; i <= iterationCount; i++) {
        // Clone the original income
        const futureIncome: Income = {
          ...income,
          id: uuidv4() // Generate a new ID for this instance
        };
        
        // Calculate next date based on recurrence pattern
        const nextDate = new Date(incomeDate);
        
        if (income.recurringFrequency === 'daily') {
          nextDate.setDate(incomeDate.getDate() + i);
        } else if (income.recurringFrequency === 'weekly') {
          nextDate.setDate(incomeDate.getDate() + (i * 7));
        } else if (income.recurringFrequency === 'monthly') {
          nextDate.setMonth(incomeDate.getMonth() + i);
        } else if (income.recurringFrequency === 'yearly') {
          nextDate.setFullYear(incomeDate.getFullYear() + i);
        }
        
        // Only include future incomes
        if (nextDate > today) {
          futureIncome.date = nextDate;
          futureIncome.description = `${income.description} (Recurrente)`;
          futureIncomes.push(futureIncome);
          console.log(`Generated future income: ${futureIncome.description} for ${nextDate.toLocaleDateString()}`);
        }
      }
    });
    
    console.log(`Generated ${futureIncomes.length} future recurring incomes`);
    return [...incomes, ...futureIncomes];
  };

  const value = {
    currentBudget,
    allBudgets,
    userSettings,
    setUserSettings,
    exchangeRate,
    selectedCurrency,
    isLoading,
    error,
    setSelectedCurrency,
    updateExchangeRate,
    addExpense,
    addIncome,
    updateExpense,
    updateIncome,
    deleteExpense,
    deleteIncome,
    updateUserSettings,
    exportData,
    importData,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
