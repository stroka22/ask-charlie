import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-300 mb-8">About Bot360AI</h1>
          
          {/* Mission Statement */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Our Mission</h2>
            <p className="text-indigo-100 text-lg mb-4">
              Bot360AI makes AI assistants practical for teams and communities—fast to launch, safe by default, and easy
              to scale.
            </p>
            <p className="text-indigo-100">
              We help organizations deliver helpful, accurate, and on-brand conversational experiences across web and
              mobile.
            </p>
          </div>
          
          {/* Our Story */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Our Story</h2>
            <p className="text-indigo-100 mb-4">
              Bot360AI started as a collaboration between product thinkers and AI engineers who wanted an easier, safer
              way to launch conversational assistants. Frustrated by brittle chatbots and generic LLM demos, we built a
              platform that combines guard-railed AI with simple visual configuration.
            </p>
            <p className="text-indigo-100">
              Today, organizations use Bot360AI to deploy branded assistants—from customer support bots to internal
              knowledge copilots—without writing custom AI code. Reliability, transparency, and ease of use remain at the
              heart of everything we build.
            </p>
          </div>
          
          {/* Values */}
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Our Values</h2>
            <ul className="text-indigo-100 space-y-3">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-200">Accuracy &amp; Safety:</strong> Every response is filtered and grounded in verified sources.</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-200">Accessibility:</strong> Great AI should be available to teams of any size or technical skill.</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-200">Innovation:</strong> We embrace cutting-edge research and turn it into practical tools.</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-200">Community:</strong> Collaboration and shared learning make assistant experiences better for everyone.</span>
              </li>
            </ul>
          </div>
          
          {/* Contact CTA */}
          <div className="text-center py-6">
            <p className="text-indigo-100 mb-4">
              Have questions or want to learn more about our mission? We'd love to hear from you.
            </p>
            <Link 
              to="/contact" 
              className="inline-block px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-gray-900 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
