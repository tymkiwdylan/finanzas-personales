import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// URL and key should be in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cexksizwepoxodxkovpw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNleGtzaXp3ZXBveG9keGtvdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzMzNDIsImV4cCI6MjA1NjQwOTM0Mn0.-ulUbx-brGb2mHGXd0AE3XETBb_3t9FLSthCu1a6Vg4';

// For server-side usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);