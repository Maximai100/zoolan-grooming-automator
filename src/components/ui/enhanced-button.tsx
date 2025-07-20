import React from 'react';
import { Button } from './button';
import { Loading } from './loading';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
  icon?: LucideIcon;
  gradient?: boolean;
  pulse?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  loading = false,
  loadingText,
  icon: Icon,
  gradient = false,
  pulse = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      className={cn(
        'transition-all duration-200',
        gradient && 'btn-primary',
        pulse && 'animate-pulse',
        !disabled && !loading && 'hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loading size="sm" />
          {loadingText || 'Загрузка...'}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </div>
      )}
    </Button>
  );
};