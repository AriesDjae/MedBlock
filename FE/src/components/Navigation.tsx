import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Code } from 'lucide-react';
import { useWallet } from '../context/WalletContext'; // Import the hook

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Grab the persistence data from the new WalletContext
  const { userRole, logout, walletAddress } = useWallet(); 

  const isActive = (path: string) => location.pathname === path;

  // Developer mode: allow viewing all pages regardless of role (for testing)
  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem('medBlockDevMode') === 'true';
  });

  // Define links based on Role
  const navLinks = [
    { path: '/', label: 'Home', icon: '🏠', show: true },
    
    // Show Records if Doctor OR in dev mode
    { path: '/patient-records', label: 'Create Record', icon: '📋', show: userRole === 'doctor' || devMode },
    
    // Show Record Explorer if Doctor OR in dev mode
    { path: '/doctor-records', label: 'View Records', icon: '🔍', show: userRole === 'doctor' || devMode },
    
    // Show Explorer if Patient OR in dev mode
    { path: '/explorer', label: 'My Records', icon: '📊', show: userRole === 'patient' || devMode },
    
    // Patient consent / access control - show if Patient OR in dev mode
    { path: '/consent', label: 'Consent', icon: '✅', show: userRole === 'patient' || devMode },
    
    // Test page - always show
    { path: '/test-contract', label: 'Test Contract', icon: '🧪', show: true },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-blue-600 group-hover:bg-blue-700 transition-colors">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 hidden sm:block">
              MedBlock
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              // Only render if 'show' is true
              link.show && (
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
              )
            ))}

            {/* LOGIN / LOGOUT BUTTON */}
            {userRole ? (
                <div className="flex items-center gap-2 ml-4">
                    {/* Developer Mode Toggle */}
                    <button
                        onClick={() => {
                            const newMode = !devMode;
                            setDevMode(newMode);
                            localStorage.setItem('medBlockDevMode', String(newMode));
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            devMode
                                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                                : 'bg-slate-800 border border-slate-600 text-gray-400 hover:bg-slate-700'
                        }`}
                        title="Developer Mode: View all pages regardless of role"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                    {/* Optional: Show small wallet address */}
                    <span className="text-xs font-mono text-gray-500 hidden lg:block">
                        {walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}
                    </span>
                    <button 
                        onClick={logout}
                        className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/register" className="px-3 py-2 text-sm text-gray-200 hover:text-white hover:bg-slate-800 rounded-md">
                  Register
                </Link>
                <Link to="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in slide-in-from-top-4 duration-200 border-t border-slate-700 pt-2">
            {navLinks.map((link) => (
              link.show && (
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
              )
            ))}
             {userRole ? (
              <button 
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10"
              >
                Logout
              </button>
            ) : (
              <div>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-200 hover:bg-slate-800"
                >
                  Register
                </Link>
                <Link 
                  to="/login"
                  onClick={() => setIsOpen(false)} 
                  className="block px-4 py-2 text-blue-400 hover:bg-slate-800"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}