import { supabase } from '../services/supabase';
import type { Character } from '../services/supabase';
import { getSafeAvatarUrl } from '../utils/imageUtils';

/**
 * Maps a raw character from the database to include safe avatar URLs
 * @param character - The raw character data from Supabase
 * @returns The character with processed avatar URLs
 */
export function mapCharacter(character: Character): Character {
  return {
    ...character,
    avatar_url: getSafeAvatarUrl(character.name, character.avatar_url),
    feature_image_url: character.feature_image_url || undefined,
  };
}

/**
 * Gets a list of all visible characters
 * @param includeHidden - Whether to include hidden characters (default: false)
 * @returns A promise resolving to an array of characters
 */
export async function listCharacters(includeHidden = false): Promise<Character[]> {
  let query = supabase
    .from('characters')
    .select('*');
  
  // Only include visible characters unless specifically requested
  if (!includeHidden) {
    query = query.eq('is_visible', true);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('Error fetching characters:', error);
    return [];
  }
  
  // Map characters to include safe avatar URLs
  return (data || []).map(mapCharacter);
}

/**
 * Gets a character by ID
 * @param id - The character ID to fetch
 * @returns A promise resolving to the character or null if not found
 */
export async function getCharacterById(id: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching character with ID ${id}:`, error);
    return null;
  }
  
  return data ? mapCharacter(data) : null;
}

/**
 * Gets characters by their IDs
 * @param ids - Array of character IDs to fetch
 * @returns A promise resolving to an array of characters
 */
export async function getCharactersByIds(ids: string[]): Promise<Character[]> {
  if (!ids.length) return [];
  
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .in('id', ids);
  
  if (error) {
    console.error('Error fetching characters by IDs:', error);
    return [];
  }
  
  return (data || []).map(mapCharacter);
}

/**
 * Searches for characters by name
 * @param searchTerm - The search term to match against character names
 * @param includeHidden - Whether to include hidden characters (default: false)
 * @returns A promise resolving to an array of matching characters
 */
export async function searchCharacters(
  searchTerm: string,
  includeHidden = false
): Promise<Character[]> {
  let query = supabase
    .from('characters')
    .select('*')
    .ilike('name', `%${searchTerm}%`);
  
  if (!includeHidden) {
    query = query.eq('is_visible', true);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('Error searching characters:', error);
    return [];
  }
  
  return (data || []).map(mapCharacter);
}

// ---------------------------------------------------------------------------
// Compatibility helpers (Bot360AI api naming)
// ---------------------------------------------------------------------------

export const sanitizeCharacter = mapCharacter;
export function sanitizeCharacters(chars: Character[]): Character[] {
  return chars.map(sanitizeCharacter);
}

// ---------------------------------------------------------------------------
// Bot360AI-style repository wrapper
// ---------------------------------------------------------------------------

export const characterRepository = {
  sanitizeCharacter,
  sanitizeCharacters,

  async getAll(isAdmin: boolean = false): Promise<Character[]> {
    let query = supabase.from('characters').select('*');
    if (!isAdmin) {
      // show visible or NULL (legacy) rows only
      query = query.or('is_visible.is.null,is_visible.eq.true');
    }
    const { data, error } = await query.order('name');
    if (error) {
      console.error('Failed to fetch characters:', error);
      throw new Error('Failed to fetch characters');
    }
    return sanitizeCharacters((data as Character[]) || []);
  },

  async getById(id: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // no rows
      console.error(`Failed to fetch character ${id}:`, error);
      throw new Error('Failed to fetch character');
    }
    return data ? sanitizeCharacter(data as Character) : null;
  },

  async getByName(name: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .ilike('name', name)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`Failed to fetch character by name ${name}:`, error);
      throw new Error('Failed to fetch character');
    }
    return data ? sanitizeCharacter(data as Character) : null;
  },

  async search(queryStr: string, isAdmin = false): Promise<Character[]> {
    let query = supabase
      .from('characters')
      .select('*')
      .ilike('name', `%${queryStr}%`);
    if (!isAdmin) {
      query = query.or('is_visible.is.null,is_visible.eq.true');
    }
    const { data, error } = await query.order('name');
    if (error) {
      console.error(`Failed to search characters '${queryStr}':`, error);
      throw new Error('Failed to search characters');
    }
    return sanitizeCharacters((data as Character[]) || []);
  },

  async createCharacter(
    character: Omit<Character, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Character> {
    const toInsert = {
      ...character,
      avatar_url: character.avatar_url
        ? getSafeAvatarUrl(character.name, character.avatar_url)
        : character.avatar_url,
      feature_image_url: character.feature_image_url
        ? getSafeAvatarUrl(character.name, character.feature_image_url)
        : character.feature_image_url,
    };
    const { data, error } = await supabase
      .from('characters')
      .insert(toInsert)
      .select('*')
      .single();
    if (error) {
      console.error('Failed to create character:', error);
      throw new Error('Failed to create character');
    }
    return sanitizeCharacter(data as Character);
  },

  async updateCharacter(
    id: string,
    updates: Partial<Omit<Character, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Character> {
    const safeUpdates = { ...updates } as typeof updates;
    if (updates.avatar_url && updates.name) {
      safeUpdates.avatar_url = getSafeAvatarUrl(updates.name, updates.avatar_url);
    }
    if (updates.feature_image_url && updates.name) {
      safeUpdates.feature_image_url = getSafeAvatarUrl(
        updates.name,
        updates.feature_image_url,
      );
    }
    const { data, error } = await supabase
      .from('characters')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      console.error(`Failed to update character ${id}:`, error);
      throw new Error('Failed to update character');
    }
    return sanitizeCharacter(data as Character);
  },

  async deleteCharacter(id: string): Promise<void> {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) {
      console.error(`Failed to delete character ${id}:`, error);
      throw new Error('Failed to delete character');
    }
  },

  async bulkCreateCharacters(
    chars: Omit<Character, 'id' | 'created_at' | 'updated_at'>[],
  ): Promise<Character[]> {
    if (chars.length === 0) return [];
    const sanitized = chars.map((c) => ({
      ...c,
      avatar_url: c.avatar_url
        ? getSafeAvatarUrl(c.name, c.avatar_url)
        : c.avatar_url,
      feature_image_url: c.feature_image_url
        ? getSafeAvatarUrl(c.name, c.feature_image_url)
        : c.feature_image_url,
    }));
    const { data, error } = await supabase
      .from('characters')
      .insert(sanitized)
      .select('*');
    if (error) {
      console.error('Failed bulk insert:', error);
      throw new Error('Failed to bulk create characters');
    }
    return sanitizeCharacters((data as Character[]) || []);
  },
};

// Mutations
// ---------------------------------------------------------------------------

/**
 * Input type for creating or updating a character.
 * All fields are optional except `id` for updates.
 *
 * NOTE: created_at / updated_at are handled by Supabase triggers.
 */
export type CharacterInput = Partial<Omit<Character, 'created_at' | 'updated_at'>>;

/**
 * Creates a new character or updates an existing one (upsert).
 * When `input.id` exists, Supabase will perform a conflict-aware update.
 *
 * @param input - Character fields to create/update
 * @returns The newly saved character (mapped) or null on failure
 */
export async function upsertCharacter(
  input: CharacterInput,
): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .upsert(input, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.error('Error upserting character:', error);
    return null;
  }

  return data ? mapCharacter(data) : null;
}

/**
 * Deletes a character by ID.
 *
 * @param id - Character ID to delete
 * @returns true when deletion succeeds, false otherwise
 */
export async function deleteCharacter(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting character ${id}:`, error);
    return false;
  }

  return true;
}
