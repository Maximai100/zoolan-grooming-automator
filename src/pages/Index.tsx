import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LandingPage from '@/components/LandingPage';
import AppLayout from '@/components/AppLayout';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  if (user) {
    return <AppLayout />;
  }

  return (
    <div onClick={(e) => {
      if (e.target instanceof HTMLElement && 
          (e.target.textContent?.includes("Попробовать бесплатно") || 
           e.target.textContent?.includes("Начать") ||
           e.target.closest('button')?.textContent?.includes("Попробовать") ||
           e.target.closest('button')?.textContent?.includes("Начать"))) {
        window.location.href = '/auth';
      }
    }}>
      <LandingPage />
    </div>
  );
};

export default Index;
