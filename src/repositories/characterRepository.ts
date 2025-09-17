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
