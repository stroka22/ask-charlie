import { supabase } from '../services/supabase';

/**
 * Default roundtable settings
 * Used as fallback when no settings are found in the database
 */
export const DEFAULT_ROUNDTABLE_SETTINGS = {
  defaults: {
    repliesPerRound: 3,
    followUpsPerRound: 2,
    maxWordsPerReply: 110,
    allowAllSpeak: false,
    strictRotation: false,
    creativity: 0.7,
    maxParticipants: 8,
    saveByDefault: true,
    enableAdvanceRound: true
  },
  /*
   * Per-tier limits.  "free" caps are slightly lower while "premium"
   * inherits the previous global limits (back-compat).
   */
  limits: {
    free: {
      repliesPerRound: { min: 1, max: 4 },
      followUpsPerRound: { min: 0, max: 2 },
      maxWordsPerReply: { min: 60, max: 140 },
      creativity: { min: 0.2, max: 0.9 },
      maxParticipants: 8
    },
    premium: {
      repliesPerRound: { min: 1, max: 6 },
      followUpsPerRound: { min: 0, max: 3 },
      maxWordsPerReply: { min: 60, max: 160 },
      creativity: { min: 0.2, max: 1.0 },
      maxParticipants: 12
    }
  },
  locks: {
    allowAllSpeak: false,
    strictRotation: false,
    enableAdvanceRound: false,
    saveByDefault: false
  }
};

// Type definitions for roundtable settings
export interface RoundtableDefaults {
  repliesPerRound: number;
  followUpsPerRound: number;
  maxWordsPerReply: number;
  allowAllSpeak: boolean;
  strictRotation: boolean;
  creativity: number;
  maxParticipants: number;
  saveByDefault: boolean;
  enableAdvanceRound: boolean;
}

export interface RoundtableLimit {
  min: number;
  max: number;
}

export interface RoundtableTierLimits {
  repliesPerRound: RoundtableLimit;
  followUpsPerRound: RoundtableLimit;
  maxWordsPerReply: RoundtableLimit;
  creativity: RoundtableLimit;
  maxParticipants: number;
}

export interface RoundtableLimits {
  free: RoundtableTierLimits;
  premium: RoundtableTierLimits;
}

export interface RoundtableLocks {
  allowAllSpeak: boolean;
  strictRotation: boolean;
  enableAdvanceRound: boolean;
  saveByDefault: boolean;
}

export interface RoundtableSettings {
  defaults: RoundtableDefaults;
  limits: RoundtableLimits;
  locks: RoundtableLocks;
}

export interface RoundtableSettingsRow {
  id?: string;
  owner_slug: string;
  defaults: RoundtableDefaults;
  limits: RoundtableLimits;
  locks: RoundtableLocks;
  created_at?: string;
  updated_at?: string;
}

/**
 * Repository for managing roundtable settings
 */
export const roundtableSettingsRepository = {
  /**
   * Get roundtable settings for a specific organization
   * @param ownerSlug - Organization identifier
   * @returns Promise<RoundtableSettings|null> - Settings object or null if not found
   */
  async getByOwnerSlug(ownerSlug: string): Promise<RoundtableSettings | null> {
    // Validate ownerSlug
    if (!ownerSlug) {
      console.warn('[roundtableSettingsRepository] Missing ownerSlug parameter');
      return DEFAULT_ROUNDTABLE_SETTINGS;
    }

    try {
      const { data, error } = await supabase
        .from('roundtable_settings')
        .select('*')
        .eq('owner_slug', ownerSlug)
        .maybeSingle();
      
      if (error) {
        console.error('[roundtableSettingsRepository] Error fetching settings:', error);
        // Return defaults rather than failing
        return DEFAULT_ROUNDTABLE_SETTINGS;
      }
      
      if (!data) {
        console.log(`[roundtableSettingsRepository] No settings found for ${ownerSlug}, using defaults`);
        return DEFAULT_ROUNDTABLE_SETTINGS;
      }
      
      // Merge with defaults to ensure all properties exist
      return {
        defaults: { ...DEFAULT_ROUNDTABLE_SETTINGS.defaults, ...data.defaults },
        limits: (() => {
          const defaultLimits = DEFAULT_ROUNDTABLE_SETTINGS.limits;
          const incoming = data.limits || {};

          // If incoming already has tier keys, merge tier-by-tier
          if (incoming.free || incoming.premium) {
            return {
              free: { ...defaultLimits.free, ...(incoming.free || {}) },
              premium: { ...defaultLimits.premium, ...(incoming.premium || {}) }
            };
          }

          // Otherwise treat incoming as flat limits applied to both tiers
          return {
            free: { ...defaultLimits.free, ...incoming },
            premium: { ...defaultLimits.premium, ...incoming }
          };
        })(),
        locks: { ...DEFAULT_ROUNDTABLE_SETTINGS.locks, ...data.locks }
      };
    } catch (err) {
      console.error('[roundtableSettingsRepository] Unexpected error fetching settings:', err);
      return DEFAULT_ROUNDTABLE_SETTINGS;
    }
  },

  /**
   * Update or insert roundtable settings for a specific organization
   * @param ownerSlug - Organization identifier
   * @param payload - Settings payload to save
   * @returns Promise<RoundtableSettingsRow> - The saved settings row
   */
  async upsertByOwnerSlug(ownerSlug: string, payload: Partial<RoundtableSettings>): Promise<RoundtableSettingsRow> {
    // Validate ownerSlug
    if (!ownerSlug) {
      throw new Error('Organization identifier (ownerSlug) is required');
    }

    // Validate payload
    if (!payload || typeof payload !== 'object') {
      throw new Error('Settings payload must be a valid object');
    }

    try {
      const { data, error } = await supabase
        .from('roundtable_settings')
        .upsert({ 
          owner_slug: ownerSlug, 
          ...payload, 
          updated_at: new Date().toISOString() 
        })
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[roundtableSettingsRepository] Error upserting settings:', error);
        throw new Error(`Failed to save roundtable settings: ${error.message}`);
      }
      
      return data as RoundtableSettingsRow;
    } catch (err) {
      console.error('[roundtableSettingsRepository] Unexpected error upserting settings:', err);
      throw err instanceof Error 
        ? err 
        : new Error(`Failed to save roundtable settings: ${String(err)}`);
    }
  }
};

export default roundtableSettingsRepository;
