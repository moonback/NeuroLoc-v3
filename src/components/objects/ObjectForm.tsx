import { useState, FormEvent } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CreateObjectInput, Category } from '../../types';

const CATEGORIES: Category[] = [
  'Bricolage',
  'Jardinage',
  'Sport',
  'Électronique',
  'Véhicules',
  'Maison',
  'Événements',
  'Autre'
];

interface ObjectFormProps {
  initialData?: Partial<CreateObjectInput>;
  onSubmit: (data: CreateObjectInput) => Promise<void>;
  submitLabel?: string;
}

export const ObjectForm = ({ initialData, onSubmit, submitLabel = 'Publier' }: ObjectFormProps) => {
  const [formData, setFormData] = useState<CreateObjectInput>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Autre',
    price_per_day: initialData?.price_per_day || 0,
    location: initialData?.location || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.price_per_day <= 0) {
      newErrors.price_per_day = 'Le prix doit être supérieur à 0';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La localisation est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Titre de l'objet"
        type="text"
        placeholder="Ex: Perceuse sans fil Bosch"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={5}
          placeholder="Décrivez votre objet en détail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Prix par jour (€)"
        type="number"
        step="0.01"
        min="0"
        placeholder="25.00"
        value={formData.price_per_day}
        onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
        error={errors.price_per_day}
        required
      />

      <Input
        label="Localisation"
        type="text"
        placeholder="Ex: Paris 75001"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        error={errors.location}
        required
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
};
