import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 
                          shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white hidden sm:block">
              Weather <span className="text-sky-400">Forecast</span>
            </span>
          </Link>

          {/* Desktop user info */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-storm-800/50 border border-storm-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 
                            flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-white">{user?.displayName || 'User'}</div>
                <div className="text-storm-400 text-xs">{user?.email}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-storm-800/50 border border-storm-700
                       hover:bg-storm-700 hover:border-storm-600
                       transition-all duration-200 text-storm-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-storm-800/50 border border-storm-700
                     hover:bg-storm-700 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-storm-800 animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-storm-800/50 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 
                            flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">{user?.displayName || 'User'}</div>
                <div className="text-storm-400 text-sm">{user?.email}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                       bg-storm-800/50 border border-storm-700
                       hover:bg-storm-700 transition-colors text-storm-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

