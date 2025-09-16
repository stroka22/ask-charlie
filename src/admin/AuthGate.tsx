import { useEffect, useState } from 'react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const k = sessionStorage.getItem('askcharlie_admin_ok');
    if (k === '1') { setOk(true); return; }
    const expected = import.meta.env.VITE_ADMIN_PASSWORD || '';
    if (!expected) { setOk(true); return; }
    const provided = prompt('Enter Admin Password');
    if (provided === expected) { sessionStorage.setItem('askcharlie_admin_ok', '1'); setOk(true); }
  }, []);
  if (!ok) return null;
  return <>{children}</>;
}
