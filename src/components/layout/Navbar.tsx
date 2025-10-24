import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useNotifications } from '../../hooks/useNotifications';
import { authService } from '../../services/auth.service';
import { RoleBadge } from '../common/RoleBadge';
import { Button } from '../common/Button';
import { Menu, Home, Package, MessageSquare, User, LogOut, Plus, Settings, X, Search, Bell, ChevronDown, HelpCircle, Grid3X3, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user } = useAuth();
  const { role } = useRole();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Gestion du scroll pour l'effet de transparence
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-left">
          <div className="font-semibold text-neutral-900 text-sm">{name}</div>
          <div className="text-xs text-neutral-500">{email}</div>
          {role && (
            <div className="mt-1">
              <RoleBadge role={role} size="sm" />
            </div>
          )}
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
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'text-brand-600 bg-brand-50' 
            : 'text-neutral-600 hover:text-brand-600 hover:bg-neutral-50'
        } ${className}`}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span className="font-medium text-sm">{children}</span>
        {badge && badge > 0 && (
          <div className="bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {badge > 9 ? '9+' : badge}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-neutral-200' 
          : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo moderne et minimaliste */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group transition-all duration-200 hover:opacity-80"
            >
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-neutral-900">
                  NeuroLoc
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  Location intelligente
                </span>
              </div>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center gap-2">
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
                  
                  {/* Boutons d'action */}
                  <div className="flex items-center gap-1 ml-2">
                    <button className="p-2 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200">
                      <Search className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200">
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button className="relative p-2 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {/* Bouton Publier */}
                  <Link to="/objects/new">
                    <Button 
                      variant="primary" 
                      size="sm"
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Publier
                    </Button>
                  </Link>
                  
                  {/* Menu utilisateur avec dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-large border border-neutral-200 py-4 z-50">
                        <div className="px-4 pb-3 border-b border-neutral-100">
                          <UserAvatar 
                            name={user.user_metadata?.full_name || 'Utilisateur'} 
                            email={user.email || ''} 
                          />
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span className="font-medium text-sm">Paramètres</span>
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-neutral-700 hover:text-accent-600 hover:bg-accent-50 transition-all duration-200"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="font-medium text-sm">Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Bouton menu mobile */}
            <button
              className="lg:hidden p-2 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Espace pour la navbar fixe */}
      <div className="h-16" />

      {/* Menu mobile */}
      <div className={`lg:hidden fixed inset-x-0 top-16 z-40 transition-all duration-300 ${
        isMenuOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-white border-b border-neutral-200 shadow-medium">
          <div className="px-4 py-6 space-y-4">
            {/* Carte utilisateur */}
            {user && (
              <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                <UserAvatar 
                  name={user.user_metadata?.full_name || 'Utilisateur'} 
                  email={user.email || ''} 
                />
              </div>
            )}
            
            {!user && (
              <>
                <NavLink to="/" icon={Home} className="w-full justify-start">
                  Accueil
                </NavLink>
                <NavLink to="/how-it-works" icon={HelpCircle} className="w-full justify-start">
                  Comment ça marche
                </NavLink>
              </>
            )}
            
            {user ? (
              <>
                <NavLink to="/dashboard" icon={User} className="w-full justify-start">
                  Tableau de bord
                </NavLink>
                <NavLink to="/objects" icon={Grid3X3} className="w-full justify-start">
                  Objets
                </NavLink>
                <NavLink to="/messages" icon={MessageSquare} badge={unreadCount} className="w-full justify-start">
                  Messages
                </NavLink>
                
                {/* Boutons d'action mobile */}
                <div className="flex gap-2 pt-2">
                  <button className="p-3 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200">
                    <Search className="h-5 w-5" />
                  </button>
                  <button className="p-3 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200">
                    <QrCode className="h-5 w-5" />
                  </button>
                  <button className="relative p-3 text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-xl transition-all duration-200">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </button>
                </div>
                
                <Link to="/objects/new" className="w-full">
                  <Button variant="primary" size="lg" leftIcon={<Plus className="h-5 w-5" />} className="w-full">
                    Publier un objet
                  </Button>
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center gap-3 w-full text-left text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 px-4 py-3 rounded-xl transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium text-sm">Paramètres</span>
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left text-neutral-700 hover:text-accent-600 hover:bg-accent-50 px-4 py-3 rounded-xl transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium text-sm">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full">
                  <Button variant="ghost" size="lg" className="w-full">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button variant="primary" size="lg" className="w-full">
                    Inscription
                  </Button>
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
