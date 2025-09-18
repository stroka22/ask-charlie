import React, { useState, useEffect } from 'react';
import { getSettings, setSettings, getOwnerSlug } from '../../services/tierSettingsService';
import roundtableSettingsRepository, {
  DEFAULT_ROUNDTABLE_SETTINGS,
} from '../../repositories/roundtableSettingsRepository';
import { characterRepository } from '../../repositories/characterRepository';
import type { Character } from '../../services/supabase';

interface AccountTierManagementProps {
  mode?: 'full' | 'roundtable-only';
}

const AccountTierManagement: React.FC<AccountTierManagementProps> = ({ mode = 'full' }) => {
  const [ownerSlug, setOwnerSlug] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Free-tier settings
  const [freeMessageLimit, setFreeMessageLimit] = useState<number>(5);
  const [freeCharacterLimit, setFreeCharacterLimit] = useState<number>(10);

  /* ------------------------------------------------------------------ */
  /*  Characters + featured assistant                                   */
  /* ------------------------------------------------------------------ */
  const [characters, setCharacters] = useState<Character[]>([]);

  const [featuredId, setFeaturedId] = useState<string>('');
  const [featuredSaving, setFeaturedSaving] = useState<boolean>(false);
  const [featuredSaveMessage, setFeaturedSaveMessage] = useState<{
    type: '' | 'success' | 'error';
    text: string;
  }>({ type: '', text: '' });

  // Roundtable settings
  const [repliesPerRound, setRepliesPerRound] = useState<number>(3);
  const [followUpsPerRound, setFollowUpsPerRound] = useState<number>(2);
  const [maxWordsPerReply, setMaxWordsPerReply] = useState<number>(110);
  const [creativity, setCreativity] = useState<number>(0.7);
  const [maxParticipants, setMaxParticipants] = useState<number>(8);
  const [allowAllSpeak, setAllowAllSpeak] = useState<boolean>(false);
  const [strictRotation, setStrictRotation] = useState<boolean>(false);
  const [enableAdvanceRound, setEnableAdvanceRound] = useState<boolean>(true);
  const [saveByDefault, setSaveByDefault] = useState<boolean>(true);

  // Roundtable limits (for validation)
  const [limits, setLimits] = useState<any>(DEFAULT_ROUNDTABLE_SETTINGS.limits);
  const [locks, setLocks] = useState<any>(DEFAULT_ROUNDTABLE_SETTINGS.locks);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the owner slug
        const slug = getOwnerSlug();
        setOwnerSlug(slug);
        
        // Fetch characters first (needed for featured-assistant UI)
        const fetchedCharacters = await characterRepository.getAll(true);
        setCharacters(fetchedCharacters);

        // Load tier + roundtable settings in parallel
        const [tierSettings, roundtableSettings] = await Promise.all([
          getSettings(slug),
          roundtableSettingsRepository.getByOwnerSlug(slug),
        ]);
        
        // Update free tier state
        if (tierSettings) {
          setFreeMessageLimit(tierSettings.freeMessageLimit || 5);
          setFreeCharacterLimit(tierSettings.freeCharacterLimit || 10);
        }
        
        // Update roundtable state
        if (roundtableSettings) {
          const { defaults, limits: rtLimits, locks: rtLocks } = roundtableSettings;
          
          // Set limits and locks for validation
          setLimits(rtLimits);
          setLocks(rtLocks);
          
          // Set form values from defaults
          setRepliesPerRound(defaults.repliesPerRound);
          setFollowUpsPerRound(defaults.followUpsPerRound);
          setMaxWordsPerReply(defaults.maxWordsPerReply);
          setCreativity(defaults.creativity);
          setMaxParticipants(defaults.maxParticipants);
          setAllowAllSpeak(defaults.allowAllSpeak);
          setStrictRotation(defaults.strictRotation);
          setEnableAdvanceRound(defaults.enableAdvanceRound);
          setSaveByDefault(defaults.saveByDefault);
        }

        /* --------------------------------------------------------------
         * Load featured assistant from localStorage
         * ------------------------------------------------------------ */
        try {
          const raw = localStorage.getItem(`featuredCharacter:${slug}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'object' && parsed !== null && parsed.id) {
              setFeaturedId(parsed.id as string);
            } else if (typeof raw === 'string') {
              // fallback old string format
              setFeaturedId(raw);
            }
          }
        } catch {
          /* ignore */
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Handle saving free tier settings
  const handleSaveFreeTier = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const success = await setSettings({
        freeMessageLimit,
        freeCharacterLimit,
        // Preserve existing values for other fields
        freeCharacters: [],
        freeCharacterNames: []
      }, ownerSlug);
      
      if (success) {
        setSuccessMessage('Free tier settings saved successfully!');
      } else {
        setError('Failed to save free tier settings.');
      }
    } catch (err) {
      console.error('Error saving free tier settings:', err);
      setError('An error occurred while saving free tier settings.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving roundtable settings
  const handleSaveRoundtable = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Prepare defaults object
      const defaults = {
        repliesPerRound,
        followUpsPerRound,
        maxWordsPerReply,
        creativity,
        maxParticipants,
        allowAllSpeak,
        strictRotation,
        enableAdvanceRound,
        saveByDefault
      };
      
      // Upsert roundtable settings, preserving existing limits and locks
      const result = await roundtableSettingsRepository.upsertByOwnerSlug(
        ownerSlug,
        { 
          defaults,
          limits,
          locks
        }
      );
      
      if (result) {
        setSuccessMessage('Roundtable settings saved successfully!');
      } else {
        setError('Failed to save roundtable settings.');
      }
    } catch (err) {
      console.error('Error saving roundtable settings:', err);
      setError('An error occurred while saving roundtable settings.');
    } finally {
      setIsLoading(false);
    }
  };

  /** ------------------------------------------------------------------
   * Featured assistant helpers
   * ---------------------------------------------------------------- */
  const saveFeaturedCharacter = () => {
    setFeaturedSaving(true);
    try {
      if (!featuredId) {
        localStorage.removeItem(`featuredCharacter:${ownerSlug}`);
        setFeaturedSaveMessage({ type: 'success', text: 'Featured assistant removed' });
      } else {
        const char = characters.find((c) => c.id === featuredId);
        if (!char) {
          setFeaturedSaveMessage({ type: 'error', text: 'Assistant not found' });
        } else {
          const json = JSON.stringify({ id: char.id, name: char.name });
          localStorage.setItem(`featuredCharacter:${ownerSlug}`, json);
          setFeaturedSaveMessage({
            type: 'success',
            text: `${char.name} set as featured assistant`,
          });
        }
      }
    } catch {
      setFeaturedSaveMessage({ type: 'error', text: 'Failed to save featured assistant' });
    } finally {
      setFeaturedSaving(false);
      setTimeout(() => setFeaturedSaveMessage({ type: '', text: '' }), 3000);
    }
  };

  // Helper to constrain a number within limits
  const constrainValue = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {isLoading && (
        <div className="p-3 bg-blue-100 text-blue-700 rounded">
          Loading settings...
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          Success: {successMessage}
        </div>
      )}
      
      {/* Free Tier Settings (only shown in 'full' mode) */}
      {mode === 'full' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* ───────────────────────── Featured assistant ───────────────────────── */}
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Tier & Featured</h2>

          <div className="mb-10">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Featured Assistant</h3>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-grow">
                <label
                  htmlFor="featuredCharacter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Featured Assistant
                </label>
                <select
                  id="featuredCharacter"
                  value={featuredId}
                  onChange={(e) => setFeaturedId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None - No featured assistant</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-4">
                {featuredSaveMessage.text && (
                  <div
                    className={`text-sm ${
                      featuredSaveMessage.type === 'success'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {featuredSaveMessage.text}
                  </div>
                )}
                <button
                  type="button"
                  onClick={saveFeaturedCharacter}
                  disabled={featuredSaving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    featuredSaving
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {featuredSaving ? 'Saving…' : 'Save Featured Assistant'}
                </button>
              </div>
            </div>
          </div>

          {/* ───────────────────────── Free tier limits ───────────────────────── */}
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Free Account Limits</h3>
          <p className="text-gray-600 mb-6">
            Configure limits for users on the free tier.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="freeMessageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Free Message Limit
              </label>
              <input
                type="number"
                id="freeMessageLimit"
                value={freeMessageLimit}
                onChange={(e) => setFreeMessageLimit(Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of messages free users can send before hitting paywall.
              </p>
            </div>
            
            <div>
              <label htmlFor="freeCharacterLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Free Character Limit
              </label>
              <input
                type="number"
                id="freeCharacterLimit"
                value={freeCharacterLimit}
                onChange={(e) => setFreeCharacterLimit(Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of characters free users can access.
              </p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleSaveFreeTier}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Saving...' : 'Save Free Tier Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Roundtable Settings (shown in both modes) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Roundtable Settings</h2>
        <p className="text-gray-600 mb-6">
          Configure default settings for roundtable discussions.
        </p>
        
        <div className="space-y-6">
          {/* Numeric settings with min/max constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="repliesPerRound" className="block text-sm font-medium text-gray-700 mb-1">
                Replies Per Round
              </label>
              <input
                type="number"
                id="repliesPerRound"
                value={repliesPerRound}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const min = limits.free.repliesPerRound.min;
                  const max = limits.free.repliesPerRound.max;
                  setRepliesPerRound(constrainValue(value, min, max));
                }}
                min={limits.free.repliesPerRound.min}
                max={limits.free.repliesPerRound.max}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Range: {limits.free.repliesPerRound.min} - {limits.free.repliesPerRound.max}
              </p>
            </div>
            
            <div>
              <label htmlFor="followUpsPerRound" className="block text-sm font-medium text-gray-700 mb-1">
                Follow-ups Per Round
              </label>
              <input
                type="number"
                id="followUpsPerRound"
                value={followUpsPerRound}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const min = limits.free.followUpsPerRound.min;
                  const max = limits.free.followUpsPerRound.max;
                  setFollowUpsPerRound(constrainValue(value, min, max));
                }}
                min={limits.free.followUpsPerRound.min}
                max={limits.free.followUpsPerRound.max}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Range: {limits.free.followUpsPerRound.min} - {limits.free.followUpsPerRound.max}
              </p>
            </div>
            
            <div>
              <label htmlFor="maxWordsPerReply" className="block text-sm font-medium text-gray-700 mb-1">
                Max Words Per Reply
              </label>
              <input
                type="number"
                id="maxWordsPerReply"
                value={maxWordsPerReply}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const min = limits.free.maxWordsPerReply.min;
                  const max = limits.free.maxWordsPerReply.max;
                  setMaxWordsPerReply(constrainValue(value, min, max));
                }}
                min={limits.free.maxWordsPerReply.min}
                max={limits.free.maxWordsPerReply.max}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Range: {limits.free.maxWordsPerReply.min} - {limits.free.maxWordsPerReply.max}
              </p>
            </div>
            
            <div>
              <label htmlFor="creativity" className="block text-sm font-medium text-gray-700 mb-1">
                Creativity (0.0 - 1.0)
              </label>
              <input
                type="number"
                id="creativity"
                value={creativity}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  const min = limits.free.creativity.min;
                  const max = limits.free.creativity.max;
                  setCreativity(constrainValue(value, min, max));
                }}
                min={limits.free.creativity.min}
                max={limits.free.creativity.max}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Range: {limits.free.creativity.min} - {limits.free.creativity.max}
              </p>
            </div>
            
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                Max Participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                value={maxParticipants}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setMaxParticipants(Math.min(Math.max(2, value), limits.free.maxParticipants));
                }}
                min="2"
                max={limits.free.maxParticipants}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Maximum: {limits.free.maxParticipants}
              </p>
            </div>
          </div>
          
          {/* Boolean settings (checkboxes) */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Behavior Settings</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowAllSpeak"
                checked={allowAllSpeak}
                onChange={(e) => setAllowAllSpeak(e.target.checked)}
                disabled={locks.allowAllSpeak}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowAllSpeak" className="ml-2 block text-sm font-medium text-gray-700">
                Allow All Speak (everyone can talk at once)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="strictRotation"
                checked={strictRotation}
                onChange={(e) => setStrictRotation(e.target.checked)}
                disabled={locks.strictRotation}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="strictRotation" className="ml-2 block text-sm font-medium text-gray-700">
                Strict Rotation (enforce turn order)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableAdvanceRound"
                checked={enableAdvanceRound}
                onChange={(e) => setEnableAdvanceRound(e.target.checked)}
                disabled={locks.enableAdvanceRound}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableAdvanceRound" className="ml-2 block text-sm font-medium text-gray-700">
                Enable Advance Round Button
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveByDefault"
                checked={saveByDefault}
                onChange={(e) => setSaveByDefault(e.target.checked)}
                disabled={locks.saveByDefault}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="saveByDefault" className="ml-2 block text-sm font-medium text-gray-700">
                Save Roundtables by Default
              </label>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleSaveRoundtable}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Saving...' : 'Save Roundtable Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTierManagement;
