import { useState, useEffect } from 'react';
import { useObjects } from '../hooks/useObjects';
import { ObjectCard } from '../components/objects/ObjectCard';
import { Loader } from '../components/common/Loader';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Search, Filter, MapPin, SlidersHorizontal, Grid, List, SortAsc } from 'lucide-react';
import { SearchFilters } from '../types';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  'Tous',
  'Bricolage',
  'Jardinage',
  'Sport',
  'Électronique',
  'Véhicules',
  'Maison',
  'Événements',
  'Autre'
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Plus récents' },
  { value: 'price_per_day', label: 'Prix croissant' },
  { value: 'price_per_day_desc', label: 'Prix décroissant' },
  { value: 'title', label: 'Nom A-Z' }
];

export const ObjectsList = () => {
  const [filters, setFilters] = useState<SearchFilters>({ status: 'available' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  
  const { objects, loading, error } = useObjects(filters);

  // Appliquer les filtres
  useEffect(() => {
    const newFilters: SearchFilters = {
      status: 'available',
      query: searchQuery || undefined,
      category: selectedCategory === 'Tous' ? undefined : selectedCategory,
      min_price: priceRange.min > 0 ? priceRange.min : undefined,
      max_price: priceRange.max < 1000 ? priceRange.max : undefined,
    };
    setFilters(newFilters);
  }, [searchQuery, selectedCategory, priceRange]);

  const handleSearch = () => {
    // La recherche est déjà gérée par useEffect
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    // TODO: Implémenter le tri côté serveur
  };

  // Tri côté client (temporaire)
  const sortedObjects = [...objects].sort((a, b) => {
    switch (sortBy) {
      case 'price_per_day':
        return a.price_per_day - b.price_per_day;
      case 'price_per_day_desc':
        return b.price_per_day - a.price_per_day;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created_at':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-heading text-4xl md:text-5xl font-bold mb-4">
              Objets disponibles près de chez vous
            </h1>
            <p className="text-body text-xl text-brand-100 max-w-2xl mx-auto">
              Découvrez tous les objets disponibles à la location dans votre région
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-large">
              <CardContent className="p-2">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Rechercher un objet (ex: perceuse, vélo, tondeuse...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      leftIcon={Search}
                      className="text-lg"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    variant="primary"
                    size="lg"
                    className="px-8"
                  >
                    Rechercher
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar des filtres */}
          <div className="lg:w-80">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-heading text-xl font-bold">Filtres</h3>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    leftIcon={<SlidersHorizontal className="h-4 w-4" />}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Catégories */}
                  <div>
                    <h4 className="text-heading font-semibold mb-3 flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Catégories
                    </h4>
                    <div className="space-y-2">
                      {CATEGORIES.map((category) => (
                        <Button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          variant={selectedCategory === category ? 'primary' : 'ghost'}
                          className="w-full justify-start"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Prix */}
                  <div>
                    <h4 className="text-heading font-semibold mb-3">Prix par jour</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        />
                      </div>
                      <div className="text-sm text-neutral-600">
                        Prix moyen: {priceRange.min}€ - {priceRange.max}€
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div>
                    <h4 className="text-heading font-semibold mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Localisation
                    </h4>
                    <div className="text-sm text-neutral-600">
                      <p>Objets disponibles dans un rayon de 50km</p>
                      <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                        Modifier la localisation
                      </Button>
                    </div>
                  </div>

                  {/* Reset filters */}
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Tous');
                      setPriceRange({ min: 0, max: 1000 });
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-heading text-xl font-bold">
                      {sortedObjects.length} objet{sortedObjects.length > 1 ? 's' : ''} trouvé{sortedObjects.length > 1 ? 's' : ''}
                    </h2>
                    {searchQuery && (
                      <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm font-medium">
                        "{searchQuery}"
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Tri */}
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4 text-neutral-600" />
                      <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="input py-2"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mode d'affichage */}
                    <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                      <Button
                        onClick={() => setViewMode('grid')}
                        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                        size="sm"
                        className="p-2"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setViewMode('list')}
                        variant={viewMode === 'list' ? 'primary' : 'ghost'}
                        size="sm"
                        className="p-2"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Résultats */}
            {loading ? (
              <Card className="py-20">
                <CardContent className="flex justify-center">
                  <Loader size="lg" />
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-accent-200 bg-accent-50">
                <CardContent className="p-8 text-center">
                  <h3 className="text-heading text-xl font-semibold text-accent-800 mb-2">
                    Erreur de chargement
                  </h3>
                  <p className="text-accent-600 mb-4">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="primary"
                    className="bg-accent-600 hover:bg-accent-700"
                  >
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            ) : sortedObjects.length === 0 ? (
              <Card className="py-20">
                <CardContent className="text-center">
                  <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-heading text-2xl font-semibold mb-4">
                    Aucun objet trouvé
                  </h3>
                  <p className="text-body mb-8 max-w-md mx-auto">
                    {searchQuery || selectedCategory !== 'Tous' || priceRange.min > 0 || priceRange.max < 1000
                      ? "Aucun objet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                      : "Aucun objet disponible pour le moment. Soyez le premier à publier !"
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Tous');
                        setPriceRange({ min: 0, max: 1000 });
                      }}
                      variant="secondary"
                    >
                      Réinitialiser les filtres
                    </Button>
                    <Link to="/signup">
                      <Button variant="primary">
                        Publier un objet
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedObjects.map((object) => (
                  <ObjectCard key={object.id} object={object} />
                ))}
              </div>
            )}

            {/* Pagination (pour plus tard) */}
            {sortedObjects.length > 0 && (
              <Card className="mt-12">
                <CardContent className="text-center py-4">
                  <p className="text-neutral-600">
                    Affichage de {sortedObjects.length} objet{sortedObjects.length > 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
