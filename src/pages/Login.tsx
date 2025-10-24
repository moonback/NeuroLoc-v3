import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/common/Card';
import { Package, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card className="shadow-large">
          <CardHeader>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Connexion</h1>
              <p className="text-neutral-600">Accédez à votre compte NeuroLoc</p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={Mail}
                required
              />

              <Input
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={Lock}
                required
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Se connecter
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="text-center w-full">
              <p className="text-neutral-600">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200">
                  S'inscrire
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
