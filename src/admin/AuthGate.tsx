import { useEffect, useState } from 'react';
import { getSession, isSupabaseAuthAvailable } from '../services/supabaseClient';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    // 1. Prefer Supabase session if configured
    (async () => {
      try {
        if (isSupabaseAuthAvailable()) {
          const session = await getSession();
          if (session) { setOk(true); return; }
          // Supabase configured but no session – go to login screen
          window.location.assign('/login');
          return;
        }
      } catch {
        /* fall through to password gate */
      }

      // 2. Fallback to simple password-prompt gate (legacy)
      const k = sessionStorage.getItem('askcharlie_admin_ok');
      if (k === '1') { setOk(true); return; }
      const expected = import.meta.env.VITE_ADMIN_PASSWORD || '';
      if (!expected) { setOk(true); return; }
      const provided = prompt('Enter Admin Password');
      if (provided === expected) {
        sessionStorage.setItem('askcharlie_admin_ok', '1');
        setOk(true);
      }
    })();
  }, []);
  if (!ok) return null;
  return <>{children}</>;
}
