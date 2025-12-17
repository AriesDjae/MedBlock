import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/patient-records', label: 'Records', icon: '📋' },
    { path: '/explorer', label: 'Explorer', icon: '🔍' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-blue-600 group-hover:bg-blue-700 transition-colors">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hidden sm:block">
              MedBlock
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
