import { useParams, useNavigate } from 'react-router-dom';
import { useObject } from '../hooks/useObjects';
import { objectsService } from '../services/objects.service';
import { ObjectForm } from '../components/objects/ObjectForm';
import { Loader } from '../components/common/Loader';
import { CreateObjectInput } from '../types';
import toast from 'react-hot-toast';

export const EditObject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { object, loading } = useObject(id!);

  const handleSubmit = async (data: CreateObjectInput) => {
    if (!id) return;

    try {
      await objectsService.updateObject(id, data);
      toast.success('Objet modifié avec succès !');
      navigate(`/objects/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification de l\'objet');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Objet non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modifier l'objet
          </h1>
          <p className="text-gray-600 mb-8">
            Mettez à jour les informations de votre objet
          </p>

          <ObjectForm
            initialData={object}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
          />
        </div>
      </div>
    </div>
  );
};
