import { useParams, useNavigate } from 'react-router-dom';
import { useObject } from '../hooks/useObjects';
import { objectsService } from '../services/objects.service';
import { ObjectForm } from '../components/objects/ObjectForm';
import { Loader } from '../components/common/Loader';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { CreateObjectInput } from '../types';
import { Edit, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center gap-4">
            <Loader size="lg" />
            <p className="text-neutral-600">Chargement de l'objet...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="p-8">
          <CardContent className="text-center">
            <p className="text-neutral-500 mb-4">Objet non trouvé</p>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-large">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <Edit className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h1 className="text-heading text-3xl font-bold">
                  Modifier l'objet
                </h1>
                <p className="text-body mt-1">
                  Mettez à jour les informations de votre objet
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ObjectForm
              initialData={object}
              onSubmit={handleSubmit}
              submitLabel="Enregistrer les modifications"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
