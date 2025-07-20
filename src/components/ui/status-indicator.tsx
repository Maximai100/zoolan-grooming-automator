import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const statusConfig = {
  // Appointment statuses
  scheduled: { 
    label: 'Запланирована', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500'
  },
  confirmed: { 
    label: 'Подтверждена', 
    color: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500'
  },
  in_progress: { 
    label: 'В процессе', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-500'
  },
  completed: { 
    label: 'Завершена', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500'
  },
  cancelled: { 
    label: 'Отменена', 
    color: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500'
  },
  no_show: { 
    label: 'Не явился', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    dot: 'bg-gray-500'
  },
  
  // Payment statuses
  paid: { 
    label: 'Оплачен', 
    color: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500'
  },
  pending: { 
    label: 'Ожидает', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-500'
  },
  failed: { 
    label: 'Ошибка', 
    color: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500'
  },
  
  // General statuses
  active: { 
    label: 'Активен', 
    color: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500'
  },
  inactive: { 
    label: 'Неактивен', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    dot: 'bg-gray-500'
  },
  draft: { 
    label: 'Черновик', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    dot: 'bg-gray-500'
  },
  published: { 
    label: 'Опубликован', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500'
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  className,
  size = 'md',
  showDot = true
}) => {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    dot: 'bg-gray-500'
  };

  return (
    <Badge 
      className={cn(
        config.color,
        'transition-all duration-200 hover:scale-105',
        size === 'sm' && 'text-xs px-2 py-0.5',
        className
      )}
    >
      {showDot && (
        <div className={cn('status-dot', config.dot)} />
      )}
      {config.label}
    </Badge>
  );
};

export const StatusDot: React.FC<{ status: string; className?: string }> = ({ 
  status, 
  className 
}) => {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    dot: 'bg-gray-500'
  };

  return (
    <div 
      className={cn(
        'w-2.5 h-2.5 rounded-full inline-block animate-pulse',
        config.dot,
        className
      )} 
    />
  );
};