import React from 'react';
import { useChat } from '../contexts/ChatContext';
import ScalableCharacterSelection from '../components/ScalableCharacterSelection';
import ChatInterface from '../components/chat/ChatInterface';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { CHARLIE } from '../data/personas/charlieKirk';

const HomePage: React.FC = () => {
  const { character, messages, chatId, selectCharacter } = useChat();
  const [resumed, setResumed] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const { tenant } = useTenant() || {};
  const pricingUrl = (tenant && tenant.pricingUrl) || '/pricing';
  const isExternalPricing = pricingUrl.startsWith('http');
  // We now always use the scalable selector, so no toggle state required.

  /* ------------------------------------------------------------
   * Detect resumed conversations.
   * A conversation is considered "resumed" when:
   *   1. We already have a selected character
   *   2. We have at least one message in context
   *   3. A chatId exists (saved chat) OR we are in bypass mode
   * ---------------------------------------------------------- */
  React.useEffect(() => {
    if (character && messages.length > 0) {
      setResumed(true);
    } else {
      setResumed(false);
    }
  }, [character, messages]);

  /* ------------------------------------------------------------
   * Start debate with Charlie Kirk
   * ---------------------------------------------------------- */
  const handleStartDebate = React.useCallback(() => {
    if (typeof selectCharacter !== 'function') return;
    /* Build a safe character object compatible with ChatContext */
    selectCharacter({
      id: CHARLIE.id,
      name: CHARLIE.name,
      description: 'Charlie Kirk debate persona',
      opening_line:
        "I’m Charlie Kirk. State your position—let’s debate.",
      avatar_url: CHARLIE.avatar_url,
      feature_image_url: CHARLIE.feature_image_url,
    });
    /* Scroll to top so chat view is visible */
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectCharacter]);

  return (
    <>
      {/* Global heavenly background for the entire page */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
        {/* Subtle light rays effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-30"></div>
        
        {/* Cloud elements for spiritual vibe */}
        <div className="absolute top-1/4 left-1/4 w-64 h-24 bg-white rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-32 bg-white rounded-full blur-3xl opacity-15 animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-28 bg-white rounded-full blur-3xl opacity-10 animate-float-slow"></div>

        {/* Subtle cross watermark */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="absolute right-6 bottom-6 w-12 h-12 opacity-10 text-white"
          fill="currentColor"
        >
          <path d="M10.5 2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v5.25h5.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H13.5v9.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V10.5H5.25a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h5.25V2.25z" />
        </svg>
      </div>

      {/* Upgrade CTA ----------------------------------------------------- */}
      <button
        onClick={() =>
          isExternalPricing
            ? window.open(pricingUrl, '_blank', 'noopener,noreferrer')
            : navigate(pricingUrl)
        }
        className="fixed top-4 right-4 z-50 inline-flex justify-center items-center px-6 py-2 border-2 border-white text-sm font-medium rounded-full shadow-sm text-white bg-red-400 hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 whitespace-nowrap transition-colors animate-pulse"
      >
        Unlock All Opponents/Features – Upgrade to Premium
      </button>

      {character ? (
        /* Chat view – mt-32 (~128 px) accounts for banner + header */
        <div className="relative flex h-screen w-full mt-32">
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      ) : (
        /* Hero CTA view – mt-32 matches chat view spacing */
        <div className="relative w-full mt-32 flex flex-col lg:flex-row items-center justify-between px-6 md:px-12">
          {/* Left column: copy + CTA */}
          <div className="max-w-xl text-center lg:text-left space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">
              Debate&nbsp;
              <span className="text-red-400">Charlie&nbsp;Kirk</span>
            </h1>
            <p className="text-blue-100 text-lg">
              Test your worldview against Charlie’s sharp conservative arguments
              or switch to Lecture mode for a guided explanation.
            </p>
            <button
              onClick={handleStartDebate}
              className="inline-flex items-center justify-center px-8 py-3 font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Start the Debate
            </button>
          </div>

          {/* Right column: feature image or fallback */}
          <div className="mt-10 lg:mt-0 lg:ml-8 w-full max-w-md">
            {CHARLIE.feature_image_url ? (
              <img
                src={CHARLIE.feature_image_url}
                alt="Charlie Kirk debating on stage"
                className="w-full h-auto rounded-lg shadow-lg border-2 border-red-500 object-cover"
                onError={(e) => {
                  /* Hide image if it fails to load */
                  if (e?.currentTarget) e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-64 rounded-lg bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 flex items-center justify-center border-2 border-red-500">
                <span className="text-red-200 font-semibold">
                  Image coming soon
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug notice for resumed chats */}
      {resumed && (
        <div className="fixed bottom-2 left-2 z-50 rounded-md bg-blue-100 px-3 py-1 text-xs text-blue-800 shadow">
          Resumed debate {chatId ? `(ID: ${chatId})` : '(local)'}
        </div>
      )}
    </>
  );
};

export default HomePage;
