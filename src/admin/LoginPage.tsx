import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signIn,
  isSupabaseAuthAvailable,
  getSession,
  getClient,
  exchangeCodeForSession,
} from '../services/supabaseClient';
import Button from '../ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const result = await signIn(email.trim());
      
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to send magic link');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };
  
  /* ------------------------------------------------------------
   *  On mount: handle magic-link return & existing sessions
   * ---------------------------------------------------------- */
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      // 0. Check for ?code returned by Supabase magic link
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        await exchangeCodeForSession(code);
        // clean URL then proceed to admin
        window.history.replaceState({}, '', '/login');
        navigate('/admin', { replace: true });
        return;
      }

      // 1. Existing session? go straight to admin
      const session = await getSession();
      if (session) {
        navigate('/admin', { replace: true });
        return;
      }

      // 2. Listen for new sign-in events
      const client = await getClient();
      if (client) {
        const { data: { subscription } } = client.auth.onAuthStateChange(
          (event) => {
            if (event === 'SIGNED_IN') navigate('/admin', { replace: true });
          },
        );
        cleanup = () => subscription.unsubscribe();
      }
    })();

    return () => cleanup?.();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy-gradient p-4">
      <div className="navy-panel rounded-xl p-6 w-full max-w-md shadow-lg">
        <h1 className="faith-heading text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        {!isSupabaseAuthAvailable() ? (
          <div className="text-center space-y-4">
            <p className="text-white/80">
              Admin access requires Supabase configuration.
            </p>
            <p className="text-sm text-white/60">
              Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
            </p>
            
            {/* Fallback to password prompt */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <Link to="/admin">
                <Button variant="secondary" className="w-full">
                  Try Password Login
                </Button>
              </Link>
            </div>
          </div>
        ) : status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-brand-blue/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-gold" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Check Your Email</h2>
            <p className="text-white/80">
              We've sent a magic link to <span className="text-brand-gold">{email}</span>
            </p>
            <p className="text-sm text-white/60">
              Click the link in the email to sign in to your account.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-navy-700/60 rounded px-3 py-2 border border-white/10 focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                required
              />
            </div>
            
            {status === 'error' && (
              <div className="text-brand-red text-sm">
                {errorMessage}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
            </Button>
            
            <div className="text-sm text-white/60 text-center">
              We'll email you a magic link for password-free sign in.
            </div>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-brand-gold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
