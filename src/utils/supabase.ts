import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>('https://cexksizwepoxodxkovpw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleGtzaXp3ZXBveG9keGtvdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzMzNDIsImV4cCI6MjA1NjQwOTM0Mn0.-ulUbx-brGb2mHGXd0AE3XETBb_3t9FLSthCu1a6Vg4');

// Helper functions for database operations
export async function fetchExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw new Error(`Error fetching expenses: ${error.message}`);
  }

  return data || [];
}

export async function addExpenseToDb(expense: Database['public']['Tables']['expenses']['Insert']) {
  console.log('addExpenseToDb - Expense data being sent to Supabase:', expense);
  
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error adding expense: ${error.message}`);
    }

    console.log('addExpenseToDb - Success response from Supabase:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in addExpenseToDb:', error);
    throw error;
  }
}

export async function updateExpenseInDb(id: string, expense: Partial<Database['public']['Tables']['expenses']['Update']>) {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw new Error(`Error updating expense: ${error.message}`);
  }

  return data;
}

export async function deleteExpenseFromDb(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw new Error(`Error deleting expense: ${error.message}`);
  }

  return true;
}

export async function fetchIncomes() {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching incomes:', error);
    throw new Error(`Error fetching incomes: ${error.message}`);
  }

  return data || [];
}

export async function addIncomeToDb(income: Database['public']['Tables']['incomes']['Insert']) {
  console.log('addIncomeToDb - Income data being sent to Supabase:', income);
  
  try {
    const { data, error } = await supabase
      .from('incomes')
      .insert([income])
      .select()
      .single();

    if (error) {
      console.error('Error adding income:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error adding income: ${error.message}`);
    }

    console.log('addIncomeToDb - Success response from Supabase:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in addIncomeToDb:', error);
    throw error;
  }
}

export async function updateIncomeInDb(id: string, income: Partial<Database['public']['Tables']['incomes']['Update']>) {
  const { data, error } = await supabase
    .from('incomes')
    .update(income)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating income:', error);
    throw new Error(`Error updating income: ${error.message}`);
  }

  return data;
}

export async function deleteIncomeFromDb(id: string) {
  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting income:', error);
    throw new Error(`Error deleting income: ${error.message}`);
  }

  return true;
}

export async function fetchUserSettings() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching user settings:', error);
    throw new Error(`Error fetching user settings: ${error.message}`);
  }

  return data;
}

export async function updateUserSettings(settings: any) {
  // First check if settings exist
  const { data: existingSettings } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1);

  let data;
  let error;

  if (existingSettings && existingSettings.length > 0) {
    // Update existing settings
    const result = await supabase
      .from('user_settings')
      .update(settings)
      .eq('id', existingSettings[0].id)
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  } else {
    // Create new settings
    const result = await supabase
      .from('user_settings')
      .insert([settings])
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('Error updating user settings:', error);
    throw new Error(`Error updating user settings: ${error.message}`);
  }

  return data;
}
