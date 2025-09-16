import { Store } from '../../services/store';
import type { Tier } from '../../services/store';
import { useState } from 'react';
import Card from '../../ui/Card';
// Button import removed; not used in this tab

function newId() { return Math.random().toString(36).slice(2); }

export default function TiersTab() {
  const [list, setList] = useState<Tier[]>(() => Store.tiers.all().length? Store.tiers.all(): [
    { id: newId(), name: 'Free', limits: { messagesPerDay: 20 } },
    { id: newId(), name: 'Pro', limits: { messagesPerDay: 200 } },
  ]);
  
  function saveAll(next: Tier[]) { setList(next); Store.tiers.save(next); }
  function updateLimit(id: string, v: number) { saveAll(list.map(t => t.id===id ? { ...t, limits: { ...t.limits, messagesPerDay: v } } : t)); }
  
  return (
    <div className="space-y-4">
      {list.map(t => (
        <Card key={t.id}>
          <div className="font-semibold">{t.name}</div>
          <label className="block mt-2 text-sm">Messages per day
            <input type="number" className="w-40 ml-2 bg-navy-700 rounded px-3 py-1" value={t.limits?.messagesPerDay||0} onChange={(e)=>updateLimit(t.id, Number(e.target.value)||0)} />
          </label>
        </Card>
      ))}
    </div>
  );
}
