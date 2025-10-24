import { Link } from 'react-router-dom';
import { RentalObject } from '../../types';
import { MapPin, Euro, Star } from 'lucide-react';

interface ObjectCardProps {
  object: RentalObject;
}

export const ObjectCard = ({ object }: ObjectCardProps) => {
  const mainImage = object.images && object.images.length > 0
    ? object.images[0]
    : 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <Link
      to={`/objects/${object.id}`}
      className="group card-hover"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={mainImage}
          alt={object.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            object.status === 'available' 
              ? 'bg-success-500 text-white' 
              : 'bg-neutral-500 text-white'
          }`}>
            {object.status === 'available' ? 'Disponible' : 'Loué'}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-heading text-lg font-semibold line-clamp-1 group-hover:text-brand-600 transition-colors duration-200">
            {object.title}
          </h3>
          <div className="flex items-center text-brand-600 font-semibold text-lg ml-2">
            <Euro className="h-4 w-4" />
            <span>{object.price_per_day}</span>
            <span className="text-sm text-neutral-500 ml-1">/jour</span>
          </div>
        </div>

        <p className="text-body text-sm mb-4 line-clamp-2">
          {object.description}
        </p>

        <div className="flex items-center text-muted text-sm mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="line-clamp-1">{object.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-lg text-sm font-medium">
            {object.category}
          </span>
          
          {/* Note moyenne simulée */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-neutral-700">4.8</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
