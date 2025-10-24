import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Package, MessageSquare, Shield, Star, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';

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
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Comment ça marche ?
            </h1>
            <p className="text-xl text-brand-100 mb-8 max-w-3xl mx-auto">
              Découvrez comment NeuroLoc révolutionne la location d'objets entre particuliers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="primary" size="lg" className="bg-white text-brand-600 hover:bg-brand-50">
                  Commencer maintenant
                </Button>
              </Link>
              <Link to="/">
                <Button variant="secondary" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-brand-600">
                  Voir les objets
                </Button>
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
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl md:text-5xl font-bold text-brand-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl font-bold mb-4">
              En 4 étapes simples
            </h2>
            <p className="text-body text-xl max-w-2xl mx-auto">
              Louez ou mettez en location vos objets en quelques clics seulement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="card-hover">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-heading text-xl font-bold mb-4">
                      {step.title}
                    </h3>
                    <p className="text-body">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Flèche entre les étapes */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-neutral-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading text-4xl font-bold mb-4">
              Pourquoi choisir NeuroLoc ?
            </h2>
            <p className="text-body text-xl max-w-2xl mx-auto">
              Des fonctionnalités avancées pour une expérience de location optimale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-heading text-xl font-bold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-body">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-heading text-4xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-body text-xl text-brand-100 mb-8">
            Rejoignez notre communauté et découvrez une nouvelle façon de louer des objets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="bg-white text-brand-600 hover:bg-brand-50">
                Créer un compte
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-brand-600">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
