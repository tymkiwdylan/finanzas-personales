// types/database.ts
export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          settings: JSON | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          settings?: JSON | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          settings?: JSON | null;
          created_at?: string;
        };
      };
      prices: {
        Row: {
          id: string;
          active: boolean;
          currency: string;
          description: string | null;
          interval: 'day' | 'week' | 'month' | 'year' | null;
          interval_count: number | null;
          metadata: JSON | null;
          product_id: string;
          trial_period_days: number | null;
          type: 'one_time' | 'recurring';
          unit_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          active?: boolean;
          currency?: string;
          description?: string | null;
          interval?: 'day' | 'week' | 'month' | 'year' | null;
          interval_count?: number | null;
          metadata?: JSON | null;
          product_id: string;
          trial_period_days?: number | null;
          type: 'one_time' | 'recurring';
          unit_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          active?: boolean;
          currency?: string;
          description?: string | null;
          interval?: 'day' | 'week' | 'month' | 'year' | null;
          interval_count?: number | null;
          metadata?: JSON | null;
          product_id?: string;
          trial_period_days?: number | null;
          type?: 'one_time' | 'recurring';
          unit_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stripe_customers: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          subscription_status: string;
          subscription_tier: string;
          subscription_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          subscription_status: string;
          subscription_tier: string;
          subscription_period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          subscription_status?: string;
          subscription_tier?: string;
          subscription_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
