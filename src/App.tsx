import { useCallback } from 'react'
import './index.css'
import { ChatProvider, useChat } from './contexts/ChatContext'
import CHARLIE from './data/personas/charlieKirk'
import ChatInterface from './components/chat/ChatInterface'
import {
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom'
import {
  ScaleIcon,
  LightBulbIcon,
  GlobeAmericasIcon,
} from '@heroicons/react/24/outline'
import AdminPage from './admin/AdminPage'

// Main app content with access to chat context
function Hero() {
  const { selectPersona } = useChat()
  const navigate = useNavigate()

  const handleStartDebate = useCallback(() => {
    selectPersona(CHARLIE)
    navigate('/chat')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectPersona, navigate])

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-brand-red via-white to-brand-blue bg-clip-text text-transparent">
          Debate Charlie&nbsp;Kirk
        </h1>

        <div className="my-6 divider" />

        <p className="text-xl text-white/80 mb-8">
          Test your worldview against Charlie&apos;s conservative arguments or
          switch to Lecture mode for guided explanations on faith, freedom, and
          America.
        </p>

        <button
          onClick={handleStartDebate}
          className="px-8 py-3 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-full shadow-lg transition-colors focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-navy-900"
        >
          Start the Debate
        </button>

        {/* Feature cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="backdrop-blur-lg bg-navy-800/60 border border-white/10 rounded-xl p-3 flex flex-col items-center text-center">
            <ScaleIcon className="w-7 h-7 text-brand-gold mb-2" />
            <h3 className="font-semibold mb-1">Challenge Ideas</h3>
            <p className="text-sm text-white/70">
              Engage in spirited debate and stress-test your worldview.
            </p>
          </div>
          {/* Card 2 */}
          <div className="backdrop-blur-lg bg-navy-800/60 border border-white/10 rounded-xl p-3 flex flex-col items-center text-center">
            <LightBulbIcon className="w-7 h-7 text-brand-gold mb-2" />
            <h3 className="font-semibold mb-1">Lecture Mode</h3>
            <p className="text-sm text-white/70">
              Switch gears for structured explanations and key takeaways.
            </p>
          </div>
          {/* Card 3 */}
          <div className="backdrop-blur-lg bg-navy-800/60 border border-white/10 rounded-xl p-3 flex flex-col items-center text-center">
            <GlobeAmericasIcon className="w-7 h-7 text-brand-gold mb-2" />
            <h3 className="font-semibold mb-1">Patriotic &amp; Faith-First</h3>
            <p className="text-sm text-white/70">
              Experience a platform rooted in freedom, family, and faith.
            </p>
          </div>
        </div>

        <div className="mt-12 p-4 bg-navy-800/50 border border-white/10 rounded-lg">
          <p className="text-sm text-white/70 italic">
            &quot;The strength of our nation comes from our faith, our families,
            and our freedom. Let&apos;s discuss what matters most.&quot; —
            Charlie Kirk
          </p>
        </div>
      </div>
    </div>
  )
}

function ChatPage() {
  const { persona } = useChat()
  const navigate = useNavigate()

  if (!persona) {
    // If no persona selected, redirect to home
    navigate('/')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ChatInterface />
      <button
        onClick={() => navigate('/')}
        className="mt-4 text-sm text-brand-gold hover:underline"
      >
        ← Back to Home
      </button>
    </div>
  )
}

function AppContent() {
  /* No local chat hooks needed here; Hero and ChatPage handle persona logic */

  return (
    <div className="min-h-screen flex flex-col bg-navy-gradient">
      {/* Header with patriotic styling */}
      <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-sm shadow-md border-b border-brand-blue/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Ask Charlie wordmark */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-extrabold text-xl tracking-tight">
              Ask<span className="text-brand-red">Charlie</span>
            </Link>
          </div>
          
          {/* Simple nav */}
          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-white hover:text-brand-gold transition-colors">
              Home
            </Link>
            <Link to="/admin" className="text-sm font-medium text-white hover:text-brand-gold transition-colors">
              Admin
            </Link>
          </nav>
        </div>
        
        {/* Patriotic stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-red via-white to-brand-blue"></div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      
      {/* Footer with patriotic accent */}
      <footer className="bg-navy-800 border-t border-brand-red/30 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-white/60">
            Ask Charlie © {new Date().getFullYear()} • 
            <span className="mx-2 text-brand-red">♦</span>
            Faith • Freedom • America
          </p>
        </div>
      </footer>
    </div>
  )
}

// Wrap with provider
function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  )
}

export default App
