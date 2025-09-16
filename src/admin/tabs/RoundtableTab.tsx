import { useState } from 'react';
import { Store } from '../../services/store';

export default function RoundtableTab() {
  const personas = Store.personas.all();
  const [topic, setTopic] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) { setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]); }

  return (
    <div className="space-y-4">
      <label className="block">Topic
        <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={topic} onChange={e=>setTopic(e.target.value)} />
      </label>
      <div className="grid md:grid-cols-2 gap-2">
        {personas.map(p => (
          <label key={p.id} className="flex items-center gap-2 bg-navy-800/60 border border-white/10 p-2 rounded">
            <input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggle(p.id)} />
            <span>{p.name}</span>
          </label>
        ))}
      </div>
      <div className="text-sm text-white/70">Selected: {selected.length} • Topic: {topic || '—'}</div>
      <div className="text-xs text-white/50">MVP placeholder — we'll wire this to a multi-agent debate flow.</div>
    </div>
  );
}
