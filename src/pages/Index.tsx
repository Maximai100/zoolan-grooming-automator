import { useState } from "react";
import { Button } from "@/components/ui/button";
import LandingPage from "@/components/LandingPage";
import AppLayout from "@/components/AppLayout";

const Index = () => {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <AppLayout />;
  }

  return (
    <div onClick={(e) => {
      if (e.target instanceof HTMLElement && 
          (e.target.textContent?.includes("Попробовать бесплатно") || 
           e.target.textContent?.includes("Начать") ||
           e.target.closest('button')?.textContent?.includes("Попробовать") ||
           e.target.closest('button')?.textContent?.includes("Начать"))) {
        setShowApp(true);
      }
    }}>
      <LandingPage />
    </div>
  );
};

export default Index;
