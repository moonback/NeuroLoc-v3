import { useState } from 'react';
import { useObjects } from '../hooks/useObjects';
import { ObjectCard } from '../components/objects/ObjectCard';
import { Input } from '../components/common/Input';
import { Loader } from '../components/common/Loader';
import { Search, Filter } from 'lucide-react';
import { SearchFilters } from '../types';

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

export const Home = () => {
  const [filters, setFilters] = useState<SearchFilters>({ status: 'available' });
  const [searchQuery, setSearchQuery] = useState('');
  const { objects, loading } = useObjects(filters);

  const handleSearch = () => {
    setFilters({ ...filters, query: searchQuery });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({
      ...filters,
      category: category === 'Tous' ? undefined : category
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Louez et partagez vos objets
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Découvrez des milliers d'objets disponibles à la location près de chez vous
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Rechercher un objet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  (category === 'Tous' && !filters.category) ||
                  filters.category === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : objects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucun objet trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {objects.map((object) => (
              <ObjectCard key={object.id} object={object} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
