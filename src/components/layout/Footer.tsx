import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b1020] border-t border-white/10 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Copyright and app info */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Bot360AI. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <Link to="/about" className="text-sm text-gray-300 hover:text-primary-400 transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-primary-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-300 hover:text-primary-400 transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-sm text-gray-300 hover:text-primary-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
