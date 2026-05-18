import { ReactNode } from 'react';

interface NexusCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

export function NexusCard({ children, className = '', padding = 'lg', hover = false }: NexusCardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <div
      className={`
        bg-card border border-border rounded-[var(--radius-card)] shadow-sm
        ${paddingStyles[padding]}
        ${hover ? 'transition-all hover:shadow-md hover:border-primary/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
