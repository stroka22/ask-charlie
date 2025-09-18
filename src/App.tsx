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
  useLocation,
} from 'react-router-dom'
import {
  ScaleIcon,
  LightBulbIcon,
  GlobeAmericasIcon,
} from '@heroicons/react/24/outline'
import Button from './ui/Button'
import AdminPage from './admin/AdminPage'
import LoginPage from './admin/LoginPage'
import clsx from 'clsx'

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
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-3xl mx-auto text-center navy-panel p-8 relative z-10 rounded-2xl">
        {/* accent stripe */}
        <div className="accent-tricolor w-20 h-1 mx-auto mb-6 rounded-full" />

        <h1 className="faith-heading text-5xl md:text-6xl font-extrabold mb-6">
          Debate&nbsp;Charlie&nbsp;Kirk
        </h1>

        <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
          Test your worldview against Charlie's conservative arguments or switch to
          Lecture&nbsp;mode for guided explanations on faith, freedom, and America.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleStartDebate} size="lg">
            Start the Debate
          </Button>
          <Link to="/admin">
            <Button variant="secondary" size="lg">
              Explore Admin
            </Button>
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="navy-panel rounded-xl p-4 flex flex-col items-center text-center">
            <ScaleIcon className="w-7 h-7 text-brand-gold mb-2" />
            <h3 className="font-semibold mb-1">Challenge Ideas</h3>
            <p className="text-sm text-white/70">
              Engage in spirited debate and stress-test your worldview.
            </p>
          </div>
          {/* Card 2 */}
          <div className="navy-panel rounded-xl p-4 flex flex-col items-center text-center">
            <LightBulbIcon className="w-7 h-7 text-brand-gold mb-2" />
            <h3 className="font-semibold mb-1">Lecture Mode</h3>
            <p className="text-sm text-white/70">
              Switch gears for structured explanations and key takeaways.
            </p>
          </div>
          {/* Card 3 */}
          <div className="navy-panel rounded-xl p-4 flex flex-col items-center text-center">
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
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className={clsx('min-h-screen flex flex-col', isAdminRoute ? 'admin-surface' : 'bg-navy-gradient')}>
      {/* Header with patriotic styling */}
      <header className={clsx('sticky top-0 z-50 backdrop-blur-sm shadow-md', isAdminRoute ? 'bg-white border-b border-gray-200' : 'bg-navy-900/95 border-b border-brand-blue/30')}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Ask Charlie wordmark */}
          <div className="flex-shrink-0">
            <Link to="/" className={clsx('font-extrabold text-xl tracking-tight', isAdminRoute ? 'text-gray-900' : 'text-white')}>
              Ask<span className="text-brand-red">Charlie</span>
            </Link>
          </div>
          
          {/* Simple nav */}
          <nav className="flex items-center space-x-6">
            <Link to="/" className={clsx('text-sm font-medium transition-colors', isAdminRoute ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-brand-gold')}>
              Home
            </Link>
            <Link to="/admin" className={clsx('text-sm font-medium transition-colors', isAdminRoute ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-brand-gold')}>
              Admin
            </Link>
          </nav>
        </div>
        
        {/* Patriotic stripe */}
        {!isAdminRoute && (
          <div className="h-1 w-full bg-gradient-to-r from-brand-red via-white to-brand-blue"></div>
        )}
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      
      {/* Footer with patriotic accent */}
      <footer className={clsx(isAdminRoute ? 'bg-white border-t border-gray-200' : 'bg-navy-800 border-t border-brand-red/30', 'py-4')}>
        <div className="container mx-auto px-4 text-center">
          <p className={clsx('text-sm', isAdminRoute ? 'text-gray-600' : 'text-white/60')}>
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
