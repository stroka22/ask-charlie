import React, { useState, useEffect } from 'react';
import { getSettings, setSettings, getOwnerSlug } from '../../services/tierSettingsService';
import roundtableSettingsRepository, { 
  DEFAULT_ROUNDTABLE_SETTINGS 
} from '../../repositories/roundtableSettingsRepository';

interface AccountTierManagementProps {
  mode?: 'full' | 'roundtable-only';
}

const AccountTierManagement: React.FC<AccountTierManagementProps> = ({ mode = 'full' }) => {
  const [ownerSlug, setOwnerSlug] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Free tier settings
  const [freeMessageLimit, setFreeMessageLimit] = useState<number>(5);
  const [freeCharacterLimit, setFreeCharacterLimit] = useState<number>(10);

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
        
        // Load tier settings and roundtable settings in parallel
        const [tierSettings, roundtableSettings] = await Promise.all([
          getSettings(slug),
          roundtableSettingsRepository.getByOwnerSlug(slug)
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

  // Helper to constrain a number within limits
  const constrainValue = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {isLoading && (
        <div className="p-3 bg-primary-100 text-primary-700 rounded">
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Free Tier Settings</h2>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of characters free users can access.
              </p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleSaveFreeTier}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
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
