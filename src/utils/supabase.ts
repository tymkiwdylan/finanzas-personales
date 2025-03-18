import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { stripe } from '@/utils/stripe/config';

// URL and key should be in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cexksizwepoxodxkovpw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleGtzaXp3ZXBveG9keGtvdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzMzNDIsImV4cCI6MjA1NjQwOTM0Mn0.-ulUbx-brGb2mHGXd0AE3XETBb_3t9FLSthCu1a6Vg4';

// For server-side usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Cache for authentication to reduce API calls
let authSessionCache: {
  session: any;
  expiresAt: number;
} | null = null;

// Keep track of refresh token promise to prevent multiple refreshes
let refreshPromise: Promise<any> | null = null;

// For client-side usage with auth - optimized to reduce token refresh calls
export const createClientBrowser = () => {
  // Create the Supabase client with default options
  const client = createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  });
  
  // Add token refresh management to avoid excessive refreshes
  const originalGetSession = client.auth.getSession.bind(client.auth);
  client.auth.getSession = async () => {
    // 1. Check if we have a cached session that's still valid
    if (authSessionCache && authSessionCache.expiresAt > Date.now()) {
      console.log('Using cached session');
      return { data: { session: authSessionCache.session }, error: null };
    }
    
    // 2. Use existing refresh promise if one is already in progress
    if (refreshPromise) {
      console.log('Using in-progress token refresh');
      try {
        await refreshPromise;
        return { data: { session: authSessionCache?.session || null }, error: null };
      } catch (error) {
        console.error('Error with existing refresh promise:', error);
        refreshPromise = null;
      }
    }
    
    // 3. Create a new refresh promise
    console.log('Creating new token refresh');
    refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const result = await originalGetSession();
        
        if (result.data.session) {
          // Calculate actual expiry time (session expires in 1 hour by default)
          // Cache for slightly less to be safe (55 minutes)
          authSessionCache = {
            session: result.data.session,
            expiresAt: Date.now() + 55 * 60 * 1000
          };
        }
        
        resolve(result);
      } catch (error) {
        console.error('Error refreshing token:', error);
        reject(error);
      } finally {
        // Clear the promise after a short delay to prevent immediate subsequent calls
        setTimeout(() => {
          refreshPromise = null;
        }, 1000);
      }
    });
    
    try {
      const result = await refreshPromise;
      return result;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return { data: { session: null }, error: error as any };
    }
  };
  
  return client;
};

// Helper to get the current user ID
export const getCurrentUserId = async () => {
  const clientBrowser = createClientBrowser();
  const { data } = await clientBrowser.auth.getSession();
  const userId = data.session?.user?.id;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  return userId;
};

// Helper functions for database operations
export async function fetchExpenses() {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw new Error(`Error fetching expenses: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchExpenses:', error);
    return [];
  }
}

export async function addExpenseToDb(expense: Omit<Database['public']['Tables']['expenses']['Insert'], 'user_id'>) {
  console.log('addExpenseToDb - Expense data being sent to Supabase:', expense);
  
  try {
    const userId = await getCurrentUserId();
    
    const expenseWithUserId = {
      ...expense,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseWithUserId])
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
  try {
    const userId = await getCurrentUserId();
    
    // Make sure we're only updating the current user's expense
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Error updating expense: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateExpenseInDb:', error);
    throw error;
  }
}

export async function deleteExpenseFromDb(id: string) {
  try {
    const userId = await getCurrentUserId();
    
    // Make sure we're only deleting the current user's expense
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Error deleting expense: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteExpenseFromDb:', error);
    throw error;
  }
}

export async function fetchIncomes() {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching incomes:', error);
      throw new Error(`Error fetching incomes: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchIncomes:', error);
    return [];
  }
}

export async function addIncomeToDb(income: Omit<Database['public']['Tables']['incomes']['Insert'], 'user_id'>) {
  console.log('addIncomeToDb - Income data being sent to Supabase:', income);
  
  try {
    const userId = await getCurrentUserId();
    
    const incomeWithUserId = {
      ...income,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('incomes')
      .insert([incomeWithUserId])
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
  try {
    const userId = await getCurrentUserId();
    
    // Make sure we're only updating the current user's income
    const { data, error } = await supabase
      .from('incomes')
      .update(income)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating income:', error);
      throw new Error(`Error updating income: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateIncomeInDb:', error);
    throw error;
  }
}

export async function deleteIncomeFromDb(id: string) {
  try {
    const userId = await getCurrentUserId();
    
    // Make sure we're only deleting the current user's income
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting income:', error);
      throw new Error(`Error deleting income: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteIncomeFromDb:', error);
    throw error;
  }
}

export async function fetchUserSettings() {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user settings:', error);
      throw new Error(`Error fetching user settings: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in fetchUserSettings:', error);
    return null;
  }
}

export async function updateUserSettings(settings: any) {
  try {
    const userId = await getCurrentUserId();
    
    // First check if settings exist for this user
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    let data;
    let error;

    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      const result = await supabase
        .from('user_settings')
        .update(settings)
        .eq('id', existingSettings[0].id)
        .eq('user_id', userId)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Create new settings with user_id
      const settingsWithUserId = {
        ...settings,
        user_id: userId
      };
      
      const result = await supabase
        .from('user_settings')
        .insert([settingsWithUserId])
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
  } catch (error) {
    console.error('Error in updateUserSettings:', error);
    throw error;
  }
}


async function createOrRetrieveCustomer({ uuid, email }: { uuid: string; email: string }): Promise<string> {
  // Check if a record exists in stripe_customers for the user
  const { data, error } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', uuid)
    .single();

  if (error && error.code !== 'PGRST116') { // 'PGRST116' means no record found
    console.error(error);
    throw new Error('Error querying stripe_customers');
  }

  if (data) {
    return data.stripe_customer_id;
  }

  // If no record, check Stripe for a customer with this email
  const customers = await stripe.customers.list({ email, limit: 1 });
  let customerId: string;

  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: uuid },
    });
    customerId = customer.id;
  }

  // Store the association in stripe_customers
  const { error: insertError } = await supabase
    .from('stripe_customers')
    .insert({ user_id: uuid, stripe_customer_id: customerId });

  if (insertError) {
    console.error(insertError);
    throw new Error('Error inserting into stripe_customers');
  }

  return customerId;
}
