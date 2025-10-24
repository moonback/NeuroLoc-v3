import { useNavigate } from 'react-router-dom';
import { objectsService } from '../services/objects.service';
import { ObjectForm } from '../components/objects/ObjectForm';
import { CreateObjectInput } from '../types';
import { LoueurOnly } from '../components/common/RoleGuard';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateObject = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateObjectInput) => {
    try {
      const newObject = await objectsService.createObject(data);
      toast.success('Objet publié avec succès !');
      navigate(`/objects/${newObject.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(errorMessage || 'Erreur lors de la création de l\'objet');
      throw error;
    }
  };

  return (
    <LoueurOnly>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-large">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Plus className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h1 className="text-heading text-3xl font-bold">
                    Publier un objet
                  </h1>
                  <p className="text-body mt-1">
                    Remplissez les informations pour mettre votre objet en location
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ObjectForm onSubmit={handleSubmit} submitLabel="Publier l'objet" />
            </CardContent>
          </Card>
        </div>
      </div>
    </LoueurOnly>
  );
};
