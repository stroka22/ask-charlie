import { useState } from 'react';
import {
  UsersIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  Bars3BottomLeftIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import AuthGate from './AuthGate';
import PersonasTab from './tabs/PersonasTab';
import CharactersTab from './tabs/CharactersTab';
import FAQTab from './tabs/FAQTab';
import StudiesTab from './tabs/StudiesTab';
import RoundtableTab from './tabs/RoundtableTab';
import TiersTab from './tabs/TiersTab';
import SuperadminTab from './tabs/SuperadminTab';
import Sidebar from '../ui/Sidebar';
import type { SidebarItem } from '../ui/Sidebar';
import Card from '../ui/Card';

const ITEMS: SidebarItem[] = [
  { key: 'Characters', label: 'Characters', icon: <UsersIcon /> },
  { key: 'Personas', label: 'Personas', icon: <UsersIcon /> },
  { key: 'FAQ', label: 'FAQ', icon: <QuestionMarkCircleIcon /> },
  { key: 'Studies', label: 'Studies', icon: <AcademicCapIcon /> },
  { key: 'Roundtable', label: 'Roundtable', icon: <ChatBubbleBottomCenterTextIcon /> },
  { key: 'Account Tiers', label: 'Account Tiers', icon: <Bars3BottomLeftIcon /> },
  { key: 'Superadmin', label: 'Superadmin', icon: <ShieldCheckIcon /> },
] as const;

type Tab = typeof ITEMS[number]['key'];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Characters');

  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col bg-navy-900 text-white">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-navy-900/95 backdrop-blur-sm sticky top-0 z-50">
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
          {/* placeholder for future actions */}
          <div />
        </header>

        {/* Content with sidebar */}
        <div className="flex flex-1">
          <Sidebar items={ITEMS} active={tab} onSelect={(k)=>setTab(k as Tab)} />

          <main className="flex-1 p-6 overflow-y-auto">
            <Card>
              {tab==='Personas' && <PersonasTab/>}
              {tab==='Characters' && <CharactersTab/>}
              {tab==='FAQ' && <FAQTab/>}
              {tab==='Studies' && <StudiesTab/>}
              {tab==='Roundtable' && <RoundtableTab/>}
              {tab==='Account Tiers' && <TiersTab/>}
              {tab==='Superadmin' && <SuperadminTab/>}
            </Card>
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
