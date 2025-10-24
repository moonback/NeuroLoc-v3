import { useState } from 'react';
import { Search, Star, Users, Shield, MapPin, CheckCircle, MessageSquare, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const FEATURES = [
  {
    icon: Shield,
    title: "Paiements sécurisés",
    description: "Transactions protégées par Stripe avec garantie de remboursement"
  },
  {
    icon: MapPin,
    title: "Géolocalisation",
    description: "Trouvez des objets près de chez vous en temps réel"
  },
  {
    icon: MessageSquare,
    title: "Messagerie intégrée",
    description: "Communiquez directement avec les propriétaires"
  },
  {
    icon: Star,
    title: "Système d'avis",
    description: "Notez et commentez vos expériences de location"
  }
];

const STATS = [
  { number: "10,000+", label: "Utilisateurs actifs", icon: Users },
  { number: "25,000+", label: "Objets disponibles", icon: Package },
  { number: "50,000+", label: "Locations réussies", icon: CheckCircle },
  { number: "4.8/5", label: "Note moyenne", icon: Star }
];

const TESTIMONIALS = [
  {
    name: "Marie Dubois",
    location: "Paris",
    text: "NeuroLoc m'a permis de rentabiliser mes outils de bricolage. C'est génial de voir mes objets utiles à d'autres !",
    rating: 5
  },
  {
    name: "Thomas Martin",
    location: "Lyon",
    text: "Service impeccable ! J'ai trouvé exactement ce dont j'avais besoin pour mon déménagement.",
    rating: 5
  },
  {
    name: "Sophie Leroy",
    location: "Marseille",
    text: "La messagerie intégrée facilite vraiment les échanges. Très pratique et sécurisé.",
    rating: 5
  }
];

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // Redirection vers une page de recherche ou traitement de la recherche
    console.log('Recherche:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-brand-500">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-700"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Location intelligente
              <br />
              <span className="text-brand-100">
                entre particuliers
              </span>
            </h1>
            <p className="text-xl text-brand-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez des milliers d'objets disponibles à la location près de chez vous. 
              Louez ce dont vous avez besoin ou rentabilisez vos objets inutilisés.
            </p>

            {/* Barre de recherche moderne */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-large">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  <input
                    type="text"
                    className="input pl-12 text-lg"
                    placeholder="Rechercher un objet (ex: perceuse, vélo, tondeuse...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/objects">
                <Button variant="secondary" size="lg">
                  Voir les objets
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Commencer à louer
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="ghost" size="lg" className="text-white hover:text-brand-100 hover:bg-white/10">
                  Comment ça marche ?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-neutral-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              Pourquoi choisir NeuroLoc ?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Des fonctionnalités avancées pour une expérience de location optimale et sécurisée
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="card-hover p-8">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Découvrez les expériences de nos membres satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="card-hover p-8">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-8 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-neutral-500 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* CTA Final */}
      <div className="py-24 bg-brand-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-xl text-brand-100 mb-12 leading-relaxed">
            Rejoignez notre communauté et découvrez une nouvelle façon de louer des objets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="secondary" size="lg">
                Créer un compte gratuit
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="text-white hover:text-brand-100 hover:bg-white/10">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
