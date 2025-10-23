import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { authService } from '../../services/auth.service';
import { Menu, Home, Package, MessageSquare, User, LogOut, Plus, Settings, X, Search, Bell, ChevronDown, HelpCircle, Grid3X3, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Gestion du scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
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

  // Composant pour les initiales de l'utilisateur
  const UserAvatar = ({ name, email }: { name: string; email: string }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {initials}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900 text-sm">{name}</div>
          <div className="text-xs text-gray-500">{email}</div>
        </div>
      </div>
    );
  };

  const NavLink = ({ to, children, icon: Icon, className = "", badge }: { 
    to: string; 
    children: React.ReactNode; 
    icon?: React.ComponentType<{ className?: string }>; 
    className?: string;
    badge?: number;
  }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
          isActive 
            ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30' 
            : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
        } ${className}`}
      >
        {Icon && <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />}
        <span className="font-medium">{children}</span>
        {badge && badge > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {badge > 9 ? '9+' : badge}
          </div>
        )}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50' 
          : 'bg-white shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo redesigné avec effet de halo */}
            <Link 
              to="/" 
              className="flex items-center space-x-4 group transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 transition-all duration-500 blur-xl scale-110"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-3 rounded-2xl shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                  <Package className="h-8 w-8 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                  NeuroLoc
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                  Location intelligente
                </span>
              </div>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              {!user && (
                <>
                  <NavLink to="/" icon={Home}>Accueil</NavLink>
                  <NavLink to="/how-it-works" icon={HelpCircle}>Comment ça marche</NavLink>
                </>
              )}

              {user ? (
                <>
                  <NavLink to="/dashboard" icon={User}>Tableau de bord</NavLink>
                  <NavLink to="/objects" icon={Grid3X3}>Objets</NavLink>

                  <NavLink to="/messages" icon={MessageSquare} badge={unreadCount}>Messages</NavLink>
                  
                  {/* Bouton scanner QR code */}
                  <Link
                    to="/qr-scanner"
                    className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
                    title="Scanner QR Code"
                  >
                    <QrCode className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </Link>
                  
                  {/* Bouton de recherche */}
                  <button className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
                    <Search className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                  
                  {/* Bouton de notifications */}
                  <button className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
                    <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </button>
                  
                  {/* Bouton Publier avec effets avancés */}
                  <Link
                    to="/objects/new"
                    className="relative flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 group overflow-hidden"
                  >
                    <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                    <span className="font-semibold">Publier</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  
                  {/* Menu utilisateur avec dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200/50 py-4 z-50">
                        <div className="px-4 pb-3 border-b border-gray-100">
                          <UserAvatar 
                            name={user.user_metadata?.full_name || 'Utilisateur'} 
                            email={user.email || ''} 
                          />
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-5 w-5" />
                            <span className="font-medium">Paramètres</span>
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:bg-blue-50 rounded-xl"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-2.5 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 group overflow-hidden"
                  >
                    <span className="font-semibold">Inscription</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Link>
                </>
              )}
            </div>

            {/* Bouton menu mobile avec animation améliorée */}
            <button
              className="lg:hidden relative p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={`absolute inset-0 h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'
                  }`} 
                />
                <X 
                  className={`absolute inset-0 h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-all duration-300 ${
                    isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Espace pour la navbar fixe */}
      <div className="h-20" />

      {/* Menu mobile avec animations améliorées */}
      <div className={`lg:hidden fixed inset-x-0 top-20 z-40 transition-all duration-500 ease-in-out ${
        isMenuOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 -translate-y-8 pointer-events-none'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-2xl rounded-b-3xl">
          <div className="px-6 py-8 space-y-4">
            {/* Carte utilisateur en haut du menu mobile */}
            {user && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 border border-blue-100">
                <UserAvatar 
                  name={user.user_metadata?.full_name || 'Utilisateur'} 
                  email={user.email || ''} 
                />
              </div>
            )}
            
            {!user && (
              <>
                <NavLink to="/" icon={Home} className="w-full justify-start text-lg">
                  Accueil
                </NavLink>
                
                <NavLink to="/how-it-works" icon={HelpCircle} className="w-full justify-start text-lg">
                  Comment ça marche
                </NavLink>
              </>
            )}
            
            {user ? (
              <>
                <NavLink to="/dashboard" icon={User} className="w-full justify-start text-lg">
                  Tableau de bord
                </NavLink>
                <NavLink to="/messages" icon={MessageSquare} badge={unreadCount} className="w-full justify-start text-lg">
                  Messages
                </NavLink>
                
                {/* Boutons d'action mobile */}
                <div className="flex space-x-3 pt-2">
                  <Link
                    to="/qr-scanner"
                    className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
                    title="Scanner QR Code"
                  >
                    <QrCode className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </Link>
                  <button className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
                    <Search className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                  <button className="relative flex items-center justify-center w-12 h-12 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group">
                    <Bell className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </button>
                </div>
                
                <Link
                  to="/objects/new"
                  className="flex items-center space-x-3 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden"
                >
                  <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="font-semibold text-lg">Publier un objet</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 w-full text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all duration-300 group"
                >
                  <Settings className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Paramètres</span>
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
                  className="block w-full text-center px-6 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl font-medium transition-all duration-300 text-lg"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg overflow-hidden group"
                >
                  <span className="relative z-10">Inscription</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu mobile */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-md z-30 transition-opacity duration-500"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};
