import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* ------------------------------------------------------------------
         * Hero – Getting Started
         * ------------------------------------------------------------------ */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 mb-3">
              Getting Started
            </h1>
            <p className="text-indigo-100 mb-6">
              Pick an assistant, ask your questions, and save your journey
              in&nbsp;
              <span className="text-cyan-300 font-semibold">My&nbsp;Conversations</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-gray-900 rounded-lg font-semibold transition-colors text-center"
              >
                Start a Conversation
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors text-center"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 mb-8">How It Works</h1>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <p className="text-indigo-100 text-lg mb-8">
              Bot360AI lets you launch AI-powered assistants for any niche—education, coaching, support, hobby communities, and more—all without code. Chat naturally and learn in an interactive way.
            </p>
            
            <div className="space-y-12 mb-8">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-cyan-400 text-gray-900 flex items-center justify-center text-2xl font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">Choose an Assistant</h3>
                  <p className="text-indigo-100">
                    Browse a growing library of assistants covering topics such as language learning, career coaching, tech support, creative writing, and more. Each assistant responds using its own profile and knowledge base.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-cyan-400 text-gray-900 flex items-center justify-center text-2xl font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">Ask Questions</h3>
                  <p className="text-indigo-100">
                    Chat naturally to get advice, explanations, brainstorming help, or just explore a topic. Assistants reply instantly with relevant insights and resources.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-cyan-400 text-gray-900 flex items-center justify-center text-2xl font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">Save & Continue Your Journey</h3>
                  <p className="text-indigo-100">
                    Save conversations, mark assistants as favourites, and pick up your learning journey any time. Everything lives in <strong>My Conversations</strong> for quick access.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Note */}
          {/* ------------------------------------------------------------------
           * User Features
           * ------------------------------------------------------------------ */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-cyan-300 mb-6">
              User Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Character Conversations */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400 text-indigo-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300">
                    Assistant Conversations
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    One-on-one dialogue with AI assistants grounded in their provided context.
                  </p>
                </div>
              </div>

              {/* Roundtable Discussions */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400 text-indigo-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300">
                    Roundtable Discussions
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Multi-character conversations that explore a topic from several perspectives.
                  </p>
                </div>
              </div>

              {/* Guided Bible Studies */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400 text-indigo-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300">
                    Guided Lessons
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Structured lessons enhanced with assistant insights and custom prompts.
                  </p>
                </div>
              </div>

              {/* Conversation Sharing */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400 text-indigo-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300">
                    Conversation Sharing
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Share conversations with others via unique links for group reflection.
                  </p>
                </div>
              </div>

              {/* Favorites & History */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400 text-indigo-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300">
                    Favorites &amp; History
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Save favorites and revisit previous conversations anytime.
                  </p>
                </div>
              </div>

              {/* Scripture References */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400 text-indigo-900 flex items-center justify-center font-extrabold">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300">
                    References &amp; Sources
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Assistants can cite sources and links for deeper exploration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Note */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">About Our AI</h2>
            <p className="text-indigo-100 mb-4">
              Responses are generated by state-of-the-art language models and may occasionally be inaccurate. Verify critical information using reliable sources.
            </p>
            <p className="text-indigo-100">
              Bot360AI is designed for informational purposes and should not substitute professional advice.
            </p>
          </div>
          
          {/* CTA Section */}
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-cyan-300 mb-6">Ready to Start Your Journey?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                Sign Up Now
              </Link>
              <Link 
                to="/" 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
              >
                Browse Assistants
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
