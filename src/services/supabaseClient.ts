/**
 * Optional Supabase client for frontend Auth
 * Only loads the Supabase library if environment variables are present
 */

// Types for null-safe client
import type { Session } from '@supabase/supabase-js';

// Check if Supabase environment variables exist
const hasSupabaseConfig = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Type for our client (or null when not configured)
type SupabaseClient = {
  auth: {
    signInWithOtp: (params: { email: string }) => Promise<any>;
    signOut: () => Promise<any>;
    getSession: () => Promise<{ data: { session: Session | null } }>;
  }
};

// Lazy-loaded client instance
let supabaseClient: SupabaseClient | null = null;

// Initialize the client if environment variables exist
async function initClient(): Promise<SupabaseClient | null> {
  if (!hasSupabaseConfig) return null;
  
  try {
    // Dynamically import Supabase only if environment variables exist
    const { createClient } = await import('@supabase/supabase-js');
    
    return createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Get the Supabase client instance (or null if not configured)
 */
export async function getClient(): Promise<SupabaseClient | null> {
  if (supabaseClient) return supabaseClient;
  
  supabaseClient = await initClient();
  return supabaseClient;
}

/**
 * Sign in with magic link (email OTP)
 * @param email User's email address
 * @returns Promise resolving to success/error
 */
export async function signIn(email: string): Promise<{ success: boolean; error?: string }> {
  const client = await getClient();
  
  if (!client) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    const { error } = await client.auth.signInWithOtp({ email });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during sign in'
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  const client = await getClient();
  
  if (!client) {
    return { success: false, error: 'Supabase not configured' };
  }
  
  try {
    const { error } = await client.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during sign out'
    };
  }
}

/**
 * Get the current session
 * @returns Session object or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  const client = await getClient();
  
  if (!client) {
    return null;
  }
  
  try {
    const { data } = await client.auth.getSession();
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Check if Supabase Auth is available
 */
export function isSupabaseAuthAvailable(): boolean {
  return hasSupabaseConfig;
}
