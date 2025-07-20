import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from './AppLayout';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <AppLayout />;
};

export default ProtectedRoute;