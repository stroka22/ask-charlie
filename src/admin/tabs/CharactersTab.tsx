import { useEffect, useState } from 'react';
import { 
  listCharacters, 
  searchCharacters, 
  upsertCharacter, 
  deleteCharacter,
  type CharacterInput
} from '../../repositories/characterRepository';
import type { Character } from '../../services/supabase';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { v4 as uuidv4 } from 'uuid';

export default function CharactersTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<CharacterInput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, []);

  // Load all characters (including hidden)
  async function loadCharacters() {
    setLoading(true);
    try {
      const data = await listCharacters(true); // includeHidden=true
      setCharacters(data);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  }

  // Search characters by name
  async function handleSearch(term: string) {
    setSearchTerm(term);
    if (!term.trim()) {
      loadCharacters();
      return;
    }

    setLoading(true);
    try {
      const results = await searchCharacters(term, true); // includeHidden=true
      setCharacters(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }

  // Create new character
  function handleCreate() {
    setEditing({
      id: uuidv4(),
      name: '',
      is_visible: true,
      persona_prompt: '',
      avatar_url: '',
      feature_image_url: ''
    });
  }

  // Edit existing character
  function handleEdit(character: Character) {
    setEditing({
      id: character.id,
      name: character.name,
      is_visible: character.is_visible,
      persona_prompt: character.persona_prompt || '',
      avatar_url: character.avatar_url || '',
      feature_image_url: character.feature_image_url || '',
      description: character.description || '',
      opening_line: character.opening_line || '',
    });
  }

  // Toggle character visibility
  async function handleToggleVisibility(character: Character) {
    try {
      const updated = await upsertCharacter({
        id: character.id,
        is_visible: !character.is_visible
      });
      
      if (updated) {
        setCharacters(characters.map(c => 
          c.id === character.id ? { ...c, is_visible: !c.is_visible } : c
        ));
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  }

  // Delete character
  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this character?')) {
      return;
    }

    try {
      const success = await deleteCharacter(id);
      if (success) {
        setCharacters(characters.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  }

  // Save character (create or update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setIsSubmitting(true);
    try {
      const saved = await upsertCharacter(editing);
      if (saved) {
        // Update the list with the new/updated character
        const exists = characters.some(c => c.id === saved.id);
        if (exists) {
          setCharacters(characters.map(c => c.id === saved.id ? saved : c));
        } else {
          setCharacters([...characters, saved]);
        }
        setEditing(null);
      }
    } catch (error) {
      console.error('Failed to save character:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search characters..."
            className="w-full px-3 py-2 bg-navy-700/60 border border-white/10 rounded"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate}>New Character</Button>
      </div>

      {/* Loading state */}
      {loading && <div className="text-center py-4">Loading characters...</div>}

      {/* Empty state */}
      {!loading && characters.length === 0 && (
        <div className="text-center py-8 text-white/60">
          {searchTerm ? 'No characters match your search' : 'No characters found'}
        </div>
      )}

      {/* Table header */}
      {!loading && characters.length > 0 && (
        <>
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] px-3 py-2 text-xs uppercase tracking-wide text-white/60 border-b border-white/10">
            <div>Avatar</div>
            <div>Name</div>
            <div className="text-center">Visible</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Character rows */}
          <div className="divide-y divide-white/10">
            {characters.map(character => (
              <div
                key={character.id}
                className="grid sm:grid-cols-[auto_1fr_auto_auto] gap-3 px-3 py-3 items-center"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-blue overflow-hidden flex items-center justify-center font-bold">
                  {character.avatar_url ? (
                    <img 
                      src={character.avatar_url} 
                      alt={character.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    character.name?.[0] || '?'
                  )}
                </div>

                {/* Name + mobile visibility */}
                <div>
                  <div className="font-semibold">{character.name}</div>
                  <div className="sm:hidden text-xs text-white/60 flex items-center gap-1 mt-1">
                    <span>Visible:</span>
                    <span className={character.is_visible ? "text-green-400" : "text-red-400"}>
                      {character.is_visible ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Visibility toggle (desktop) */}
                <div className="hidden sm:flex justify-center">
                  <button
                    onClick={() => handleToggleVisibility(character)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      character.is_visible ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {character.is_visible ? "✓" : "×"}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-2 py-1 text-sm bg-white/10 rounded"
                    onClick={() => handleEdit(character)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-sm bg-red-500/20 text-red-400 rounded"
                    onClick={() => handleDelete(character.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit/Create Form */}
      {editing && (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-3 mt-4">
            <h3 className="text-lg font-bold mb-2">
              {editing.id && characters.some(c => c.id === editing.id)
                ? "Edit Character"
                : "Create Character"}
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                Name
                <input
                  className="w-full mt-1 bg-navy-700/60 border border-white/10 rounded px-3 py-2"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  required
                />
              </label>

              <label className="block">
                Visibility
                <select
                  className="w-full mt-1 bg-navy-700/60 border border-white/10 rounded px-3 py-2"
                  value={editing.is_visible ? "true" : "false"}
                  onChange={e => setEditing({ ...editing, is_visible: e.target.value === "true" })}
                >
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </label>

              <label className="block">
                Avatar URL
                <input
                  className="w-full mt-1 bg-navy-700/60 border border-white/10 rounded px-3 py-2"
                  value={editing.avatar_url || ""}
                  onChange={e => setEditing({ ...editing, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </label>

              <label className="block">
                Feature Image URL
                <input
                  className="w-full mt-1 bg-navy-700/60 border border-white/10 rounded px-3 py-2"
                  value={editing.feature_image_url || ""}
                  onChange={e => setEditing({ ...editing, feature_image_url: e.target.value })}
                  placeholder="https://example.com/feature.jpg"
                />
              </label>

              <label className="block md:col-span-2">
                Opening Line
                <input
                  className="w-full mt-1 bg-navy-700/60 border border-white/10 rounded px-3 py-2"
                  value={editing.opening_line || ""}
                  onChange={e => setEditing({ ...editing, opening_line: e.target.value })}
                  placeholder="Hello, I'm [character name]..."
                />
              </label>

              <label className="block md:col-span-2">
                Description
                <textarea
                  className="w-full mt-1 bg-navy-700/60 border border-white/10 rounded px-3 py-2 h-20"
                  value={editing.description || ""}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Brief description of the character..."
                />
              </label>

              <label className="block md:col-span-2">
                Persona Prompt
                <textarea
                  className="w-full mt-1 bg-navy-700/60 border border-white/10 rounded px-3 py-2 h-40"
                  value={editing.persona_prompt || ""}
                  onChange={e => setEditing({ ...editing, persona_prompt: e.target.value })}
                  placeholder="Detailed system prompt for the character's persona..."
                />
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Character"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setEditing(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
