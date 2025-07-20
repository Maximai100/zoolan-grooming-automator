import LandingPage from '@/components/LandingPage';

const Index = () => {
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
