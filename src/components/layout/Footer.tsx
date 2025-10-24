import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">NeuroLoc</span>
            </div>
            <p className="text-neutral-400 max-w-md mb-6 leading-relaxed">
              La plateforme de location d'objets entre particuliers. Louez et mettez en location vos objets en toute sécurité.
            </p>
            
            {/* Informations de contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-neutral-400">
                <Mail className="h-4 w-4" />
                <span>contact@neuroloc.fr</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400">
                <Phone className="h-4 w-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400">
                <MapPin className="h-4 w-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/objects" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Objets disponibles
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Nous contacter
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-neutral-400 text-sm">Suivez-nous :</span>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-brand-500 transition-colors duration-200">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-brand-500 transition-colors duration-200">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-brand-500 transition-colors duration-200">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-brand-500 transition-colors duration-200">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <p className="text-neutral-400 text-sm">
              &copy; {new Date().getFullYear()} NeuroLoc. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
