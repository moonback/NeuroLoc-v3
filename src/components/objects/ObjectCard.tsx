import { Link } from 'react-router-dom';
import { RentalObject } from '../../types';
import { MapPin, Euro } from 'lucide-react';

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
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={object.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {object.status === 'available' ? 'Disponible' : 'Loué'}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
          {object.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {object.description}
        </p>

        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{object.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {object.category}
          </span>
          <div className="flex items-center text-blue-600 font-bold text-lg">
            <Euro className="h-5 w-5" />
            <span>{object.price_per_day}</span>
            <span className="text-sm text-gray-500 ml-1">/jour</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
