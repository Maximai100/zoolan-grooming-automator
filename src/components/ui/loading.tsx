import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  className = '', 
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`loading-skeleton ${className}`}></div>
);

export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Загрузка...' }) => (
  <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
    <Loading size="lg" text={text} />
  </div>
);

export const CardLoading: React.FC = () => (
  <div className="space-y-3 p-6">
    <div className="flex items-center space-x-4">
      <LoadingSkeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-3 w-3/4" />
      </div>
    </div>
    <LoadingSkeleton className="h-20 w-full" />
  </div>
);

export const TableLoading: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <LoadingSkeleton className="w-8 h-8 rounded-full" />
        <LoadingSkeleton className="h-4 flex-1" />
        <LoadingSkeleton className="h-4 w-20" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);