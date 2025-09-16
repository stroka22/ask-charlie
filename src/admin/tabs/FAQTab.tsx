import { useState } from 'react';
import { Store } from '../../services/store';
import type { FAQItem } from '../../services/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

function newId() { return Math.random().toString(36).slice(2); }

export default function FAQTab() {
  const [list, setList] = useState<FAQItem[]>(() => Store.faqs.all());
  const [q, setQ] = useState('');
  const [a, setA] = useState('');

  function saveAll(next: FAQItem[]) { setList(next); Store.faqs.save(next); }
  function add() { if (!q.trim() || !a.trim()) return; saveAll([...list, { id: newId(), question: q.trim(), answer: a.trim() }]); setQ(''); setA(''); }
  function del(id: string) { saveAll(list.filter(x => x.id !== id)); }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">Question
          <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} />
        </label>
        <label className="block">Answer
          <input className="w-full mt-1 bg-navy-700 rounded px-3 py-2" value={a} onChange={e=>setA(e.target.value)} />
        </label>
      </div>
      <Button onClick={add}>Add FAQ</Button>
      <div className="space-y-2">
        {list.map(item => (
          <Card key={item.id}>
            <div className="font-semibold">Q: {item.question}</div>
            <div className="text-white/80">A: {item.answer}</div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={()=>del(item.id)}>
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
