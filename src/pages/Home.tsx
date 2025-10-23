import { useState } from 'react';
import { Search, Star, Users, Shield, MapPin, CheckCircle, MessageSquare, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Location intelligente
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                entre particuliers
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Découvrez des milliers d'objets disponibles à la location près de chez vous. 
              Louez ce dont vous avez besoin ou rentabilisez vos objets inutilisés.
            </p>

            {/* Barre de recherche améliorée */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none text-lg"
                    placeholder="Rechercher un objet (ex: perceuse, vélo, tondeuse...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/objects"
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Voir les objets
              </Link>
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Commencer à louer
              </Link>
              <Link
                to="/how-it-works"
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Comment ça marche ?
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fonctionnalités */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir NeuroLoc ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des fonctionnalités avancées pour une expérience de location optimale et sécurisée
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Témoignages */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez les expériences de nos membres satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* CTA Final */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez notre communauté et découvrez une nouvelle façon de louer des objets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Créer un compte gratuit
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
