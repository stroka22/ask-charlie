import React, { useState, useEffect } from 'react';
import { getOwnerSlug } from '../../services/tierSettingsService';
import { characterRepository } from '../../repositories/characterRepository';
import type { Character } from '../../services/supabase';

const AdminFeaturedAssistant: React.FC = () => {
  const [ownerSlug, setOwnerSlug] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [featuredId, setFeaturedId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the owner slug
        const slug = getOwnerSlug();
        setOwnerSlug(slug);
        
        // Fetch characters
        const fetchedCharacters = await characterRepository.getAll(true);
        setCharacters(fetchedCharacters);

        // Load featured assistant from localStorage
        try {
          const raw = localStorage.getItem(`featuredCharacter:${slug}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'object' && parsed !== null && parsed.id) {
              setFeaturedId(parsed.id as string);
            } else if (typeof raw === 'string') {
              // fallback for legacy string format
              setFeaturedId(raw);
            }
          }
        } catch {
          /* ignore localStorage errors */
        }
      } catch (err) {
        console.error('Error loading featured assistant data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save featured assistant to localStorage
  const saveFeaturedAssistant = () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (!featuredId) {
        localStorage.removeItem(`featuredCharacter:${ownerSlug}`);
        setSuccessMessage('Featured assistant removed');
      } else {
        const character = characters.find((c) => c.id === featuredId);
        if (!character) {
          setError('Assistant not found');
        } else {
          const json = JSON.stringify({ id: character.id, name: character.name });
          localStorage.setItem(`featuredCharacter:${ownerSlug}`, json);
          setSuccessMessage(`${character.name} set as featured assistant`);
        }
      }
    } catch (err) {
      console.error('Error saving featured assistant:', err);
      setError('Failed to save featured assistant');
    } finally {
      setIsSaving(false);
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Featured Assistant</h2>
      <p className="text-gray-600 mb-6">
        Select an assistant to feature prominently on the home page. This assistant will be highlighted
        for users when they first visit the site.
      </p>
      
      {/* Status Messages */}
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Success: {successMessage}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-grow">
          <label
            htmlFor="featuredAssistant"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Featured Assistant
          </label>
          <select
            id="featuredAssistant"
            value={featuredId}
            onChange={(e) => setFeaturedId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">None - No featured assistant</option>
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="button"
            onClick={saveFeaturedAssistant}
            disabled={isSaving || isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isSaving || isLoading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSaving ? 'Saving…' : 'Save Featured Assistant'}
          </button>
        </div>
      </div>
      
      {featuredId && (
        <div className="mt-6 p-4 border border-blue-200 rounded-md bg-blue-50">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Currently Featured</h3>
          <div className="flex items-center">
            {characters.find(c => c.id === featuredId)?.avatar_url && (
              <img
                src={characters.find(c => c.id === featuredId)?.avatar_url}
                alt={characters.find(c => c.id === featuredId)?.name}
                className="h-12 w-12 rounded-full mr-4 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(characters.find(c => c.id === featuredId)?.name || 'Assistant')}&background=random`;
                }}
              />
            )}
            <div>
              <p className="font-medium text-blue-900">
                {characters.find(c => c.id === featuredId)?.name || 'Unknown Assistant'}
              </p>
              <p className="text-sm text-blue-700">
                {characters.find(c => c.id === featuredId)?.short_biography || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedAssistant;
