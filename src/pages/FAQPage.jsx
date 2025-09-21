import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { listPublishedFaqs } from '../services/faqs';

/**
 * FAQPage Component
 * 
 * Displays frequently asked questions in an organized, expandable format.
 * Pulls data from the same source used by the admin FAQ editor.
 */
const FAQPage = () => {
  /* ------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------ */
  const FAQ_STORAGE_KEY = 'bot360ai_faqs';
  const LEGACY_KEY = 'faqItems';
  const LEGACY_KEY2 = 'faithTalkAI_faqs';

  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load FAQs – prefer Supabase, then fallback to localStorage / network / defaults
  useEffect(() => {
    setIsLoading(true);
    (async () => {
      /* --------------------------------------------------------------
       * 0) Try Supabase (shared, server-backed)
       * ------------------------------------------------------------ */
      try {
        const supaFaqs = await listPublishedFaqs();
        if (Array.isArray(supaFaqs) && supaFaqs.length > 0) {
          setFaqs(supaFaqs);
          const uniqueCategories = [
            ...new Set(supaFaqs.map(f => f.category || 'General')),
          ];
          setCategories(uniqueCategories);
          const initCat = {};
          uniqueCategories.forEach(c => (initCat[c] = true));
          setExpandedCategories(initCat);

          // cache in localStorage for offline / anon users
          try {
            localStorage.setItem(
              FAQ_STORAGE_KEY,
              JSON.stringify(supaFaqs),
            );
          } catch {
            /* quota ignored */
          }
          setIsLoading(false);
          return; // success, stop further fallbacks
        }
      } catch (err) {
        console.warn('[FAQPage] Supabase fetch failed, falling back:', err);
      }

      /* ------------------------------------------------------------------
       * Existing fallback chain: localStorage → /faq.json → defaults
       * ------------------------------------------------------------------ */
    try {
      /* --------------------------------------------------------------
       * 1) Try localStorage (new key first, then legacy)
       * ------------------------------------------------------------ */
      const savedFaqsRaw =
        localStorage.getItem(FAQ_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_KEY) ||
        localStorage.getItem(LEGACY_KEY2);

      if (savedFaqsRaw) {
        const parsedFaqs = JSON.parse(savedFaqsRaw);
        setFaqs(parsedFaqs);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(parsedFaqs.map(faq => faq.category || 'General'))];
        setCategories(uniqueCategories);
        
        // Initialize all categories as expanded
        const initialExpandedCategories = {};
        uniqueCategories.forEach(category => {
          initialExpandedCategories[category] = true;
        });
        setExpandedCategories(initialExpandedCategories);

        // Ensure data is written back with new key for future reads
        try {
          localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(parsedFaqs));
        } catch {/* ignore quota errors */}

      } else {
        /* --------------------------------------------------------------
         * 2) Try network fetch (/faq.json) for a shared FAQ resource
         *    (wrapped in an async IIFE to avoid top-level await)
         * ------------------------------------------------------------ */
        (async () => {
          const fetchRemoteFaqs = async () => {
            try {
              const res = await fetch('/faq.json', { credentials: 'omit' });
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                  localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(data));
                  return data;
                }
              }
            } catch {
              /* network failure ignored – will fallback */
            }
            return null;
          };

          const remoteFaqs = await fetchRemoteFaqs();

          if (remoteFaqs) {
            setFaqs(remoteFaqs);
            const uniqueCategories = [...new Set(remoteFaqs.map(faq => faq.category || 'General'))];
            setCategories(uniqueCategories);
            const initialExpandedCategories = {};
            uniqueCategories.forEach(cat => { initialExpandedCategories[cat] = true; });
            setExpandedCategories(initialExpandedCategories);
            return; // exit early on success
          }

          /* ----------------------------------------------------------
           * 3) Final fallback – hard-coded defaults
           * -------------------------------------------------------- */
        const defaultFaqs = [
          {
            id: '1',
            question: `What is Bot360AI?`,
            answer: `Bot360AI is a fully-customisable AI-assistant platform.  You can create and deploy conversational “experts” for any niche—education, coaching, customer service, hobby communities, and more—without writing code.`,
            category: 'General',
            isVisible: true,
          },
          {
            id: '2',
            question: `How accurate are the character responses?`,
            answer: `Each assistant responds based on the profile and context you provide, combined with state-of-the-art language models. While we strive for helpful and relevant answers, responses should be considered informational and not definitive advice.`,
            category: 'General',
            isVisible: true,
          },
          {
            id: '3',
            question: `What's included in the premium subscription?`,
            answer: `Premium subscribers get unlimited messages with all assistants, no advertisements, priority support, and access to exclusive assistant templates not available to free users.`,
            category: 'Pricing',
            isVisible: true,
          },
          {
            id: '4',
            question: `Can I cancel my subscription anytime?`,
            answer: `Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period.`,
            category: 'Pricing',
            isVisible: true,
          },
          {
            id: '5',
            question: `How do I save my conversations?`,
            answer: `All conversations are automatically saved to your account. You can access them anytime from the "My Conversations" page when you're logged in.`,
            category: 'Usage',
            isVisible: true,
          },
        ];
        
        setFaqs(defaultFaqs);
        
        // Extract unique categories from default FAQs
        const uniqueCategories = [...new Set(defaultFaqs.map(faq => faq.category || 'General'))];
        setCategories(uniqueCategories);
        
        // Initialize all categories as expanded
        const initialExpandedCategories = {};
        uniqueCategories.forEach(category => {
          initialExpandedCategories[category] = true;
        });
        setExpandedCategories(initialExpandedCategories);
        })(); // end IIFE
      }
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError('Failed to load FAQ content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
    })();
  }, []);

  // Toggle a question's expanded state
  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle a category's expanded state
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter FAQs by visibility
  const visibleFaqs = faqs.filter(
    faq => faq.isVisible !== false && faq.isPublished !== false,
  );

  // Group FAQs by category
  const faqsByCategory = categories.reduce((acc, category) => {
    acc[category] = visibleFaqs.filter(faq => (faq.category || 'General') === category);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-cyan-300">Frequently Asked Questions</h1>
            <Link
              to="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* No FAQs message */}
          {!isLoading && !error && visibleFaqs.length === 0 && (
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">
                No FAQs Available
              </h3>
              <p className="text-indigo-100 mb-6">
                Check back later for frequently asked questions and answers.
              </p>
            </div>
          )}

          {/* FAQ Categories and Questions */}
          {!isLoading && !error && categories.map(category => (
            <div 
              key={category} 
              className="mb-8 bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg overflow-hidden shadow-lg"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-xl font-semibold text-cyan-300">{category}</h2>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-cyan-300 transition-transform duration-300 ${expandedCategories[category] ? 'rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>

              {/* Questions in this category */}
              {expandedCategories[category] && (
                <div className="px-6 py-2">
                  {faqsByCategory[category].length === 0 ? (
                    <p className="text-indigo-200 py-4 italic">No questions in this category</p>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {faqsByCategory[category].map(faq => (
                        <div key={faq.id} className="py-4">
                          <button
                            onClick={() => toggleQuestion(faq.id)}
                            className="w-full flex justify-between items-start text-left"
                          >
                            <h3 className="text-lg font-medium text-white pr-8">{faq.question}</h3>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-5 w-5 text-cyan-300 mt-1 flex-shrink-0 transition-transform duration-300 ${expandedQuestions[faq.id] ? 'rotate-180' : ''}`}
                              viewBox="0 0 20 20" 
                              fill="currentColor"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          </button>
                          
                          {/* Answer (collapsible) */}
                          {expandedQuestions[faq.id] && (
                            <div className="mt-3 text-indigo-100 bg-white/5 p-4 rounded-lg">
                              <p className="whitespace-pre-line">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Contact section */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">
              Still have questions?
            </h2>
            <p className="text-indigo-100 mb-6">
              If you couldn't find the answer you were looking for, feel free to reach out to our support team.
            </p>
            <Link
              to="/contact"
              className="px-6 py-3 bg-cyan-400 text-gray-900 rounded-lg font-semibold hover:bg-cyan-300 transition-colors inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
