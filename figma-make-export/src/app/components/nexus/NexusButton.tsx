import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface NexusButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export function NexusButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}: NexusButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-l from-primary to-[#3b82f6] text-white hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]',
    secondary: 'bg-card border-2 border-border text-foreground hover:bg-muted active:scale-[0.98]',
    tertiary: 'text-primary hover:bg-accent active:scale-[0.98]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-[var(--radius-button)]',
    lg: 'px-8 py-4 text-lg rounded-[var(--radius-button)]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
