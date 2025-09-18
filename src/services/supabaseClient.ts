/**
 * Front-end helper utilities for Supabase Auth.
 * These functions now reuse the singleton client created in `supabase.ts`
 * so we don’t create multiple GoTrueClient instances (fixes console warning).
 */

import type { Session, SupabaseClient } from '@supabase/supabase-js';
import {
  supabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from './supabase';

/**
 * Returns the already-initialised Supabase client created in `supabase.ts`.
 * Keeps the original nullable signature so callers do not break.
 */
export async function getClient(): Promise<SupabaseClient | null> {
  return supabase ?? null;
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
    const { error } = await client.auth.signInWithOtp({
      email,
      // redirect back to /login so the app can finalise the session and route to /admin
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    
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
 * Exchange a one-time code (from magic-link / PKCE flow) for a session.
 * @param code The `code` query-param value received on the redirect URL
 * @returns true when the exchange succeeds
 */
export async function exchangeCodeForSession(code: string): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;

  try {
    // Exchange the one-time auth code for a persistent session
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error exchanging code for session:', err);
    return false;
  }
}

/**
 * Check if Supabase Auth is available
 */
export function isSupabaseAuthAvailable(): boolean {
  // Treat auth as available only when real env vars are provided (no placeholders)
  const urlOk = typeof SUPABASE_URL === 'string' && SUPABASE_URL.includes('.supabase.co');
  const keyOk =
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.length > 40 &&
    !SUPABASE_ANON_KEY.includes('PLACEHOLDER_TOKEN') &&
    !SUPABASE_ANON_KEY.startsWith('MISSING_ENV');
  return urlOk && keyOk;
}
