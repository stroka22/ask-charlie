import { createClient } from '@supabase/supabase-js';

// =========================================================================
// Environment Configuration with Hardened Fallbacks
// =========================================================================

/* -----------------------------------------------------------------------
 * Environment helpers – rely solely on Vite's import.meta.env
 * --------------------------------------------------------------------- */
const ENV_URL: string | undefined = import.meta?.env?.VITE_SUPABASE_URL;
const ENV_ANON: string | undefined = import.meta?.env?.VITE_SUPABASE_ANON_KEY;

// ---------------------------------------------------------------------------
// Hardened env handling
//   • If BOTH env vars present  → use them
//   • If NEITHER present       → use hard-coded fallbacks (dev/demo)
//   • If only ONE present       → log error, use placeholder strings so the
//                                failure is obvious (avoid mixing pairs)
// ---------------------------------------------------------------------------

const hasEnvUrl = !!ENV_URL;
const hasEnvAnon = !!ENV_ANON;

let resolvedUrl: string;
let resolvedAnon: string;

if (hasEnvUrl && hasEnvAnon) {
  // Fully-specified via env
  resolvedUrl = ENV_URL as string;
  resolvedAnon = ENV_ANON as string;
} else if (!hasEnvUrl && !hasEnvAnon) {
  // Dev fallback
  resolvedUrl = 'https://erhganndmqucihkygdxm.supabase.co';
  resolvedAnon =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaGdhbm5kbXF1Y2loa3lnZHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.PLACEHOLDER_TOKEN';
  console.warn(
    '[supabase] Using bundled fallback credentials (dev/demo only). ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production.',
  );
} else {
  // Partial config – hard fail loudly
  resolvedUrl = ENV_URL || 'MISSING_ENV_SUPABASE_URL';
  resolvedAnon = ENV_ANON || 'MISSING_ENV_SUPABASE_ANON_KEY';
  console.error(
    '[supabase] Incomplete Supabase environment configuration. ' +
      'Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. ' +
      'Falling back to placeholder values – API calls will fail with 401.',
  );
}

export const SUPABASE_URL = resolvedUrl;
export const SUPABASE_ANON_KEY = resolvedAnon;

// =========================================================================
// Database Types - these should match your Supabase schema
// =========================================================================

// Character type definition
export interface Character {
  id: string;
  name: string;
  description?: string;
  persona_prompt?: string;
  opening_line?: string;
  avatar_url?: string;
  feature_image_url?: string;
  is_visible?: boolean;
  short_biography?: string;
  bible_book?: string;
  scriptural_context?: string;
  timeline_period?: string;
  historical_context?: string;
  geographic_location?: string;
  key_scripture_references?: string;
  theological_significance?: string;
  relationships?: Record<string, string[]>;
  study_questions?: string;
  created_at?: string;
  updated_at?: string;
}

// Conversation type definition
export interface Conversation {
  id: string;
  user_id: string;
  character_id: string;
  title: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  character?: Character;
}

// Chat message type definition
export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// User profile type definition
export interface Profile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  role?: 'user' | 'pastor' | 'admin' | 'superadmin';
  owner_slug?: string;
  created_at?: string;
  updated_at?: string;
}

// Character group type definition
export interface CharacterGroup {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  icon?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// Character group mapping type definition
export interface CharacterGroupMapping {
  id: string;
  group_id: string;
  character_id: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// Tier settings type definition
export interface TierSettings {
  owner_slug: string;
  free_message_limit: number;
  free_character_limit: number;
  free_characters: string[];
  free_character_names: string[];
  updated_at?: string;
  created_at?: string;
}

// =========================================================================
// Supabase Client Initialization
// =========================================================================

// Initialize the Supabase client with the URL and anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Warn developers when fallback credentials are being used
if (!ENV_URL || !ENV_ANON) {
  console.warn(
    '[supabase] Using fallback Supabase credentials. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env.',
  );
}

// =========================================================================
// Helper Functions
// =========================================================================

/**
 * Checks if the Supabase connection is working
 * @returns A promise that resolves to a boolean indicating if the connection is working
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('characters').select('count');
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

/**
 * Gets the current Supabase configuration for debugging
 * @returns An object with the current Supabase configuration
 */
export function getSupabaseConfig() {
  return {
    url: SUPABASE_URL,
    projectId: SUPABASE_URL.split('https://')[1].split('.')[0],
    hasAnonKey: !!SUPABASE_ANON_KEY,
  };
}
