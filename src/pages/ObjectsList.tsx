import { useState, useEffect } from 'react';
import { useObjects } from '../hooks/useObjects';
import { ObjectCard } from '../components/objects/ObjectCard';
import { Loader } from '../components/common/Loader';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Objets disponibles près de chez vous
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Découvrez tous les objets disponibles à la location dans votre région
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="max-w-3xl mx-auto">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar des filtres */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filtres</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Catégories */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Catégories
                  </h4>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'text-gray-700 hover:bg-blue-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Prix par jour</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Prix moyen: {priceRange.min}€ - {priceRange.max}€
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Localisation
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>Objets disponibles dans un rayon de 50km</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium mt-2">
                      Modifier la localisation
                    </button>
                  </div>
                </div>

                {/* Reset filters */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Tous');
                    setPriceRange({ min: 0, max: 1000 });
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {sortedObjects.length} objet{sortedObjects.length > 1 ? 's' : ''} trouvé{sortedObjects.length > 1 ? 's' : ''}
                  </h2>
                  {searchQuery && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      "{searchQuery}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Tri */}
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4 text-gray-600" />
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mode d'affichage */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Résultats */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-red-800 mb-2">
                    Erreur de chargement
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : sortedObjects.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-50 rounded-2xl p-12">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Aucun objet trouvé
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchQuery || selectedCategory !== 'Tous' || priceRange.min > 0 || priceRange.max < 1000
                      ? "Aucun objet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                      : "Aucun objet disponible pour le moment. Soyez le premier à publier !"
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Tous');
                        setPriceRange({ min: 0, max: 1000 });
                      }}
                      className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200"
                    >
                      Réinitialiser les filtres
                    </button>
                    <Link
                      to="/signup"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Publier un objet
                    </Link>
                  </div>
                </div>
              </div>
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
              <div className="mt-12 text-center">
                <p className="text-gray-600">
                  Affichage de {sortedObjects.length} objet{sortedObjects.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
