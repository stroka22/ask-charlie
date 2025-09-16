// Simple localStorage-backed store for MVP; later can swap to Supabase
export type PersonaRecord = {
  id: string;
  name: string;
  avatarUrl?: string;
  featureImageUrl?: string;
  systemPrompt: string;
  defaultMode?: 'Debate'|'Lecture';
};

export type FAQItem = { id: string; question: string; answer: string };
export type Study = { id: string; title: string; description?: string; outline?: string };
export type Tier = { id: string; name: string; limits?: { messagesPerDay?: number } };

const KEYS = {
  personas: 'askcharlie_personas',
  faqs: 'askcharlie_faqs',
  studies: 'askcharlie_studies',
  tiers: 'askcharlie_tiers',
};

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const Store = {
  personas: {
    all(): PersonaRecord[] { return read<PersonaRecord[]>(KEYS.personas, []); },
    save(list: PersonaRecord[]) { write(KEYS.personas, list); },
  },
  faqs: {
    all(): FAQItem[] { return read<FAQItem[]>(KEYS.faqs, []); },
    save(list: FAQItem[]) { write(KEYS.faqs, list); },
  },
  studies: {
    all(): Study[] { return read<Study[]>(KEYS.studies, []); },
    save(list: Study[]) { write(KEYS.studies, list); },
  },
  tiers: {
    all(): Tier[] { return read<Tier[]>(KEYS.tiers, []); },
    save(list: Tier[]) { write(KEYS.tiers, list); },
  },
};
