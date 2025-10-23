import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Loader } from './components/common/Loader';
import { Home } from './pages/Home';
import { HowItWorks } from './pages/HowItWorks';
import { ObjectsList } from './pages/ObjectsList';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { ObjectDetails } from './pages/ObjectDetails';
import { CreateObject } from './pages/CreateObject';
import { EditObject } from './pages/EditObject';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { QRCodeScanner } from './pages/QRCodeScanner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const HomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Si l'utilisateur est connecté, rediriger vers le tableau de bord
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Sinon, afficher la page d'accueil pour les non connectés
  return <Home />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/objects" element={<ObjectsList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/objects/:id" element={<ObjectDetails />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />

            <Route
              path="/qr-scanner"
              element={
                <ProtectedRoute>
                  <QRCodeScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/objects/new"
              element={
                <ProtectedRoute>
                  <CreateObject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/objects/:id/edit"
              element={
                <ProtectedRoute>
                  <EditObject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
