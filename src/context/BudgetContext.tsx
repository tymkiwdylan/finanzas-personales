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
  updateUserSettings as updateUserSettingsInDb
} from '@/utils/supabase';

type BudgetContextType = {
  currentBudget: MonthlyBudget | null;
  allBudgets: MonthlyBudget[];
  userSettings: UserSettings;
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
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [allBudgets, setAllBudgets] = useState<MonthlyBudget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('ARS');
  const [exchangeRate, setExchangeRate] = useState<number>(1000); // Default rate
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize or load data on first mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user settings from database
        const settings = await fetchUserSettings();
        if (settings) {
          setUserSettings({
            name: settings.default_currency === 'ARS' ? 'Usuario' : 'User',
            preferredCurrency: settings.default_currency as Currency,
            recurringExpenses: []
          });
          setSelectedCurrency(settings.default_currency as Currency);
          setExchangeRate(settings.exchange_rate);
        } else {
          // If no settings, fetch exchange rate and create default settings
          const rate = await getExchangeRate();
          setExchangeRate(rate);
          
          // Save default settings to database
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
    
    initializeData();
    
    // Set up exchange rate refresh every hour
    const interval = setInterval(async () => {
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
    }, 3600000);
    
    return () => clearInterval(interval);
  }, []);
  
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
      recurring: expense.isRecurring || false,
      recurring_interval: expense.isRecurring ? expense.recurringFrequency : null
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
      recurring: income.isRecurring || false,
      recurring_interval: income.isRecurring ? income.recurringFrequency : null
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
      
      // Reload data to ensure everything is in sync
      console.log('Reloading data after adding expense...');
      await loadData();
      console.log('Data reloaded after adding expense');
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
      
      // Reload data to ensure everything is in sync
      console.log('Reloading data after adding income...');
      await loadData();
      console.log('Data reloaded after adding income');
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

  // Load data from database
  const loadData = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Fetch expenses and incomes from database
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
          currency: exp.currency as Currency,
          category: exp.category,
          isRecurring: exp.recurring,
          recurringFrequency: exp.recurring_interval // Changed from recurrenceType to recurringFrequency for consistency
        };
      });
      
      console.log('Processed expenses:', processedExpenses);
      
      console.log('Raw incomes from DB:', incomes);
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
        
        const processedIncome = {
          id: inc.id,
          description: inc.description,
          amount: inc.amount,
          date: incDate,
          currency: inc.currency as Currency,
          category: inc.category as IncomeCategory,
          isRecurring: inc.recurring,
          recurringFrequency: inc.recurring_interval
        };
        return processedIncome;
      });
      
      console.log('Processed incomes:', processedIncomes);
      
      // Group by month and year
      const budgetsByMonthYear = new Map<string, any>();
      
      // Process expenses
      processedExpenses.forEach(expense => {
        // Use the expense.date directly since we already created a proper Date object
        const month = expense.date.getMonth();
        const year = expense.date.getFullYear();
        const key = `${month}-${year}`;
        console.log(`Expense date: ${expense.date.toISOString()}, month: ${month}, year: ${year}, key: ${key}`);
        
        if (!budgetsByMonthYear.has(key)) {
          budgetsByMonthYear.set(key, {
            id: uuidv4(),
            month: month,
            year,
            expenses: [],
            incomes: [],
            preferredCurrency: selectedCurrency,
            exchangeRate,
          });
        }
        
        budgetsByMonthYear.get(key).expenses.push(expense);
      });
      
      // Process incomes
      processedIncomes.forEach(income => {
        // Use the income.date directly since we already created a proper Date object
        const month = income.date.getMonth();
        const year = income.date.getFullYear();
        const key = `${month}-${year}`;
        console.log(`Income date: ${income.date.toISOString()}, month: ${month}, year: ${year}, key: ${key}`);
        
        if (!budgetsByMonthYear.has(key)) {
          budgetsByMonthYear.set(key, {
            id: uuidv4(),
            month,
            year,
            expenses: [],
            incomes: [],
            preferredCurrency: selectedCurrency,
            exchangeRate,
          });
        }
        
        budgetsByMonthYear.get(key).incomes.push(income);
      });
      
      // Convert map to array
      const budgets = Array.from(budgetsByMonthYear.values());
      
      // Check if we have any budgets
      if (budgets.length === 0) {
        console.log('No budgets were created from the processed data');
      } else {
        console.log(`Created ${budgets.length} budgets from processed data`);
      }
      
      // Log all budget months and years for debugging
      budgets.forEach(budget => {
        console.log(`Budget: Month=${budget.month} (${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][budget.month]}), Year=${budget.year}, ${budget.expenses.length} expenses, ${budget.incomes.length} incomes`);
      });
      
      console.log('Processed budgets:', budgets);
      setAllBudgets(budgets);
      
      // Set current budget to the most recent one
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // JavaScript months are 0-based: 0=Jan, 1=Feb, 2=Mar, etc.
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      console.log(`Today's date: ${today.toLocaleDateString()}`);  
      console.log(`Looking for budget for ${monthNames[currentMonth]} (month index ${currentMonth}) and year ${currentYear}`);
      const currentBudget = budgets.find(
        (budget: MonthlyBudget) =>
          budget.month === currentMonth && budget.year === currentYear
      );
      
      console.log('Found current budget:', currentBudget);
      if (currentBudget) {
        console.log(`Setting current budget for ${currentMonth}/${currentYear} with ${currentBudget.expenses.length} expenses and ${currentBudget.incomes.length} incomes`);
        setCurrentBudget(currentBudget);
      } else {
        console.warn('No current budget found for the current month and year!');
        // Create an empty budget for the current month if none exists
        const newBudget: MonthlyBudget = {
          id: uuidv4(),
          month: currentMonth,
          year: currentYear,
          expenses: [],
          incomes: [],
          preferredCurrency: selectedCurrency,
          exchangeRate,
        };
        
        console.log('Created new empty budget for current month:', newBudget);
        setCurrentBudget(newBudget);
        setAllBudgets(prev => [...prev, newBudget]);
      }
    } catch (error) {
      console.error('Error loading data from database:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentBudget,
    allBudgets,
    userSettings,
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
