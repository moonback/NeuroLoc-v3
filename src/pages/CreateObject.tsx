import { useNavigate } from 'react-router-dom';
import { objectsService } from '../services/objects.service';
import { ObjectForm } from '../components/objects/ObjectForm';
import { CreateObjectInput } from '../types';
import toast from 'react-hot-toast';

export const CreateObject = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateObjectInput) => {
    try {
      const newObject = await objectsService.createObject(data);
      toast.success('Objet publié avec succès !');
      navigate(`/objects/${newObject.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création de l\'objet');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Publier un objet
          </h1>
          <p className="text-gray-600 mb-8">
            Remplissez les informations pour mettre votre objet en location
          </p>

          <ObjectForm onSubmit={handleSubmit} submitLabel="Publier l'objet" />
        </div>
      </div>
    </div>
  );
};
