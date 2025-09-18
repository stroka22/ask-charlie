import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  /**
   * When `simplified` is true the header only shows
   * the app logo / title and hides user-action buttons.
   * This is used by the “simplified” layout variant.
   */
  simplified?: boolean;
}

const Header: React.FC<HeaderProps> = ({ simplified = false }) => {
  const { user, signOut } = useAuth();
  // Very simple admin check – replace with a proper role system if available
  const isAdmin = user?.email === 'admin@example.com';

  return (
    <header className="sticky top-0 z-50 bg-[#0b1020]/80 backdrop-blur-md border-b border-white/10 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/App Name */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-primary-400 drop-shadow-lg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <circle cx="10" cy="10" r="8" />
          </svg>
          <span className="text-xl font-bold text-white tracking-wide drop-shadow-sm">
            Bot360AI
          </span>
        </Link>

        {/* Upgrade / Pricing (always visible, very prominent) */}
        <Link
          to="/pricing"
          className="ml-6 rounded-full bg-primary-500 px-5 py-2 text-lg font-extrabold tracking-wide text-white shadow-lg ring-2 ring-primary-300 hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-200"
        >
          UPGRADE
        </Link>

        {/* Right side: auth-specific actions */}
        <div className="flex items-center space-x-3">
          {/* Auth-specific actions */}
          {!simplified && user && (
            <>
              {/* Admin Panel link (visible only for admin users) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm py-1 px-3 rounded-md bg-primary-400/15 text-primary-200 hover:bg-primary-400/25 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <span className="hidden md:inline text-sm text-white/70">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm py-1 px-3 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-sm"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div> {/* Ensure container div is properly closed */}
    </header>
  );
};

export default Header;
