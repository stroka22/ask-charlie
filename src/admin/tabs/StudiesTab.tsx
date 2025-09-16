import { useState } from 'react';
import { Store } from '../../services/store';
import type { Study } from '../../services/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

function newId() { return Math.random().toString(36).slice(2); }

export default function StudiesTab() {
  const [list, setList] = useState<Study[]>(() => Store.studies.all());
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  function saveAll(next: Study[]) { setList(next); Store.studies.save(next); }
  function add() { if (!title.trim()) return; saveAll([...list, { id: newId(), title, description: desc }]); setTitle(''); setDesc(''); }
  function del(id: string) { saveAll(list.filter(x=>x.id!==id)); }

  return (
    <div className="space-y-4">
      {/* Input form wrapped in Card */}
      <Card>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block">Title
            <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} />
          </label>
          <label className="block">Description
            <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={desc} onChange={e=>setDesc(e.target.value)} />
          </label>
        </div>
        <div className="mt-3">
          <Button onClick={add}>Add Study</Button>
        </div>
      </Card>

      <div className="space-y-2">
        {list.map(s => (
          <Card key={s.id}>
            <div className="font-semibold">{s.title}</div>
            <div className="text-white/80">{s.description}</div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => del(s.id)}
            >
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
