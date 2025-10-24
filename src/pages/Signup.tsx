import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { RoleSelector } from '../components/common/RoleSelector';
import { Package } from 'lucide-react';
import { UserRole } from '../types';
import toast from 'react-hot-toast';

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Le nom complet est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authService.signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role
      });
      toast.success('Compte créé avec succès !');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-3 rounded-full mb-4">
              <Package className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Inscription</h1>
            <p className="text-gray-600 mt-2">Créez votre compte NeuroLoc</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nom complet"
              type="text"
              placeholder="Jean Dupont"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              error={errors.full_name}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
            />

            <RoleSelector
              selectedRole={formData.role}
              onRoleChange={(role) => setFormData({ ...formData, role })}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              S'inscrire
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
