import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { Menu, Home, Package, MessageSquare, User, LogOut, Plus, Settings, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Gestion du scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Déconnexion réussie');
      navigate('/login');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const NavLink = ({ to, children, icon: Icon, className = "" }: { 
    to: string; 
    children: React.ReactNode; 
    icon?: React.ComponentType<{ className?: string }>; 
    className?: string;
  }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
          isActive 
            ? 'text-blue-600 bg-blue-50 shadow-sm' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        } ${className}`}
      >
        {Icon && <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />}
        <span className="font-medium">{children}</span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-pulse" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo avec animation */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-105"
            >
              <div className="relative">
                <Package className="h-8 w-8 text-blue-600 transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NeuroLoc
              </span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              <NavLink to="/" icon={Home}>Accueil</NavLink>

              {user ? (
                <>
                  <NavLink to="/dashboard" icon={User}>Tableau de bord</NavLink>
                  <NavLink to="/messages" icon={MessageSquare}>Messages</NavLink>
                  <NavLink to="/profile" icon={Settings}>Profil</NavLink>
                  
                  <Link
                    to="/objects/new"
                    className="relative flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                  >
                    <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
                    <span className="font-semibold">Publier</span>
                    <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 group"
                  >
                    <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 hover:bg-gray-50 rounded-lg"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                  >
                    <span className="font-semibold">Inscription</span>
                    <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </Link>
                </>
              )}
            </div>

            {/* Bouton menu mobile avec animation */}
            <button
              className="lg:hidden relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`absolute inset-0 h-6 w-6 text-gray-700 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'
                  }`} 
                />
                <X 
                  className={`absolute inset-0 h-6 w-6 text-gray-700 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Espace pour la navbar fixe */}
      <div className="h-16" />

      {/* Menu mobile avec animations */}
      <div className={`lg:hidden fixed inset-x-0 top-16 z-40 transition-all duration-300 ease-in-out ${
        isMenuOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-xl">
          <div className="px-4 py-6 space-y-2">
            <NavLink to="/" icon={Home} className="w-full justify-start">
              Accueil
            </NavLink>
            
            {user ? (
              <>
                <NavLink to="/dashboard" icon={User} className="w-full justify-start">
                  Tableau de bord
                </NavLink>
                <NavLink to="/messages" icon={MessageSquare} className="w-full justify-start">
                  Messages
                </NavLink>
                <NavLink to="/profile" icon={Settings} className="w-full justify-start">
                  Profil
                </NavLink>
                
                <Link
                  to="/objects/new"
                  className="flex items-center space-x-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg group"
                >
                  <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
                  <span className="font-semibold">Publier un objet</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full text-left text-gray-700 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition-all duration-300 group"
                >
                  <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl font-medium transition-all duration-300"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg font-semibold"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu mobile */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};
