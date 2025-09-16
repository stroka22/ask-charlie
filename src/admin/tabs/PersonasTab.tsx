import { useMemo, useState } from 'react';
import { Store } from '../../services/store';
import type { PersonaRecord } from '../../services/store';
import { unparse, parse } from 'papaparse';
import type { ParseResult } from 'papaparse';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

function newId() { return Math.random().toString(36).slice(2); }

export default function PersonasTab() {
  const [list, setList] = useState<PersonaRecord[]>(() => Store.personas.all());
  const [editing, setEditing] = useState<PersonaRecord | null>(null);

  const csv = useMemo(() => unparse(list.map(p => ({
    id: p.id, name: p.name, avatar_url: p.avatarUrl || '', feature_image_url: p.featureImageUrl || '', default_mode: p.defaultMode || '', system_prompt: p.systemPrompt,
  }))), [list]);

  function saveAll(next: PersonaRecord[]) { setList(next); Store.personas.save(next); }

  function onCreate() { setEditing({ id: newId(), name: '', systemPrompt: '', defaultMode: 'Debate' }); }
  function onEdit(p: PersonaRecord) { setEditing(p); }
  function onDelete(id: string) { saveAll(list.filter(p => p.id !== id)); }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!editing) return;
    const exists = list.some(p => p.id === editing.id);
    const next = exists ? list.map(p => p.id===editing.id? editing: p) : [...list, editing];
    saveAll(next); setEditing(null);
  }

  function importCSV(file: File) {
    parse(file, { header: true, complete: (res: ParseResult<any>) => {
      const rows = (res.data as any[]).filter(Boolean);
      const imported: PersonaRecord[] = rows.map(r => ({
        id: r.id || newId(),
        name: r.name || '',
        avatarUrl: r.avatar_url || r.avatarUrl || '',
        featureImageUrl: r.feature_image_url || r.featureImageUrl || '',
        defaultMode: (r.default_mode || r.defaultMode || 'Debate') as any,
        systemPrompt: r.system_prompt || r.systemPrompt || '',
      }));
      saveAll(imported);
    } });
  }

  function downloadCSV() {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'personas.csv';
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={onCreate}>New Persona</Button>
        <Button variant="secondary" onClick={downloadCSV}>Export CSV</Button>
        <label className="px-3 py-2 bg-white/10 rounded cursor-pointer">Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importCSV(f); }} />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map(p => (
          <Card key={p.id}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">{p.name?.[0]||'?'}</div>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-white/60">Default: {p.defaultMode||'Debate'}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-2 py-1 text-sm bg-white/10 rounded" onClick={()=>onEdit(p)}>Edit</button>
              <button className="px-2 py-1 text-sm bg-white/10 rounded" onClick={()=>onDelete(p.id)}>Delete</button>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <form onSubmit={onSubmit}>
          <Card className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="block">Name
              <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={editing.name} onChange={e=>setEditing({...editing!, name: e.target.value})}/>
            </label>
            <label className="block">Default Mode
              <select className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={editing.defaultMode||'Debate'} onChange={e=>setEditing({...editing!, defaultMode: e.target.value as any})}>
                <option>Debate</option>
                <option>Lecture</option>
              </select>
            </label>
            <label className="block">Avatar URL
              <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={editing.avatarUrl||''} onChange={e=>setEditing({...editing!, avatarUrl: e.target.value})}/>
            </label>
            <label className="block">Feature Image URL
              <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={editing.featureImageUrl||''} onChange={e=>setEditing({...editing!, featureImageUrl: e.target.value})}/>
            </label>
            <label className="block md:col-span-2">System Prompt (Markdown)
              <textarea className="w-full mt-1 bg-navy-700 rounded px-3 py-2 h-40" value={editing.systemPrompt} onChange={e=>setEditing({...editing!, systemPrompt: e.target.value})}/>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="ghost" type="button" onClick={()=>setEditing(null)}>Cancel</Button>
          </div>
          </Card>
        </form>
      )}
    </div>
  );
}
