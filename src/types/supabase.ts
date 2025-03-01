export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          date: string
          currency: string
          category: string
          recurring: boolean
          recurring_interval?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          date: string
          currency: string
          category: string
          recurring: boolean
          recurring_interval?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          date?: string
          currency?: string
          category?: string
          recurring?: boolean
          recurring_interval?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          id: string
          description: string
          amount: number
          date: string
          currency: string
          category: string
          recurring: boolean
          recurring_interval?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          date: string
          currency: string
          category: string
          recurring: boolean
          recurring_interval?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          date?: string
          currency?: string
          category?: string
          recurring?: boolean
          recurring_interval?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          default_currency: string
          exchange_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          default_currency: string
          exchange_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          default_currency?: string
          exchange_rate?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
