import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Package, MessageSquare, Shield, Star, Clock, MapPin } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      icon: Package,
      title: "1. Publiez votre objet",
      description: "Créez une annonce détaillée avec photos et description de votre objet à louer",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "2. Recevez des demandes",
      description: "Les utilisateurs intéressés vous contactent via notre messagerie intégrée",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: MessageSquare,
      title: "3. Organisez la location",
      description: "Planifiez la remise et le retour de l'objet avec le locataire",
      color: "from-green-500 to-green-600"
    },
    {
      icon: CheckCircle,
      title: "4. Gagnez de l'argent",
      description: "Recevez vos paiements sécurisés et donnez votre avis sur l'expérience",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Paiements sécurisés",
      description: "Transactions protégées par Stripe avec garantie de remboursement"
    },
    {
      icon: MapPin,
      title: "Géolocalisation",
      description: "Trouvez des objets près de chez vous avec notre système de géolocalisation"
    },
    {
      icon: MessageSquare,
      title: "Messagerie intégrée",
      description: "Communiquez directement avec les propriétaires via notre chat sécurisé"
    },
    {
      icon: Star,
      title: "Système d'avis",
      description: "Notez et commentez vos expériences pour une communauté de confiance"
    },
    {
      icon: Clock,
      title: "Disponibilité flexible",
      description: "Louez pour quelques heures, jours ou semaines selon vos besoins"
    },
    {
      icon: Users,
      title: "Communauté vérifiée",
      description: "Profils vérifiés et système de confiance pour des locations en toute sécurité"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Utilisateurs actifs" },
    { number: "25,000+", label: "Objets disponibles" },
    { number: "50,000+", label: "Locations réussies" },
    { number: "4.8/5", label: "Note moyenne" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Comment ça marche ?
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Découvrez comment NeuroLoc révolutionne la location d'objets entre particuliers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Commencer maintenant
              </Link>
              <Link
                to="/"
                className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Voir les objets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
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

      {/* Steps Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              En 4 étapes simples
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Louez ou mettez en location vos objets en quelques clics seulement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {step.description}
                  </p>
                </div>
                
                {/* Flèche entre les étapes */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir NeuroLoc ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des fonctionnalités avancées pour une expérience de location optimale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
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

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez notre communauté et découvrez une nouvelle façon de louer des objets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Créer un compte
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
