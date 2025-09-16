import type { ReactNode } from 'react';

export type SidebarItem = { key: string; label: string; icon: ReactNode };

export default function Sidebar({ items, active, onSelect }: { items: SidebarItem[]; active: string; onSelect: (k: string) => void }) {
  return (
    <aside className="w-60 shrink-0 bg-navy-800/60 border-r border-white/10 h-[calc(100vh-57px)] sticky top-[57px]">
      <div className="p-3 space-y-1">
        {items.map(it => (
          <button key={it.key} onClick={()=>onSelect(it.key)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${active===it.key? 'bg-brand-blue/30 text-white' : 'hover:bg-white/10 text-white/80'}`}>
            <span className="w-5 h-5 text-white/80">{it.icon}</span>
            <span className="text-sm font-medium">{it.label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
