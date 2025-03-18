'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClientBrowser } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const supabase = createClientBrowser();
  const router = useRouter();

  useEffect(() => {
    // Track if the component is mounted to prevent state updates after unmount
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Debounce function to reduce duplicate subscription status fetches
    const fetchSubscriptionStatus = async (userId: string) => {
      // Clear any existing timeout to prevent duplicate calls
      if (timeoutId) clearTimeout(timeoutId);
      
      // Set new timeout with minimal delay
      timeoutId = setTimeout(async () => {
        if (!mounted) return; // Skip if component is unmounted
        
        try {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('subscription_status')
            .eq('user_id', userId)
            .single();
            
          if (mounted) {
            setSubscriptionStatus(subscription?.subscription_status as string | null);
          }
        } catch (error) {
          console.error('Error fetching subscription status:', error);
          if (mounted) setSubscriptionStatus(null);
        }
      }, 300);
    };
    
    // Initialize session data once on component mount
    const getInitialSession = async () => {
      if (!mounted) return;
      setIsLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted && session) {
          setSession(session);
          setUser(session.user);
          
          // Get subscription status if user exists
          if (session.user) {
            fetchSubscriptionStatus(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state change listener - only update when necessary
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (!mounted) return; // Prevent updates if unmounted
        
        // Update state based on new session
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only fetch subscription status when we have a user, otherwise clear it
        if (session?.user) {
          fetchSubscriptionStatus(session.user.id);
        } else {
          setSubscriptionStatus(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false; // Mark component as unmounted
      if (timeoutId) clearTimeout(timeoutId); // Clean up any pending timeouts
      subscription.unsubscribe(); // Unsubscribe from auth changes
    };
  }, [supabase])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      // Redirect to root page after successful logout
      router.push('/');
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  } as AuthContextType;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
