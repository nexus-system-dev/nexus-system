import { ReactNode } from 'react';

interface NexusInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'url';
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  helperText?: string;
  icon?: ReactNode;
}

export function NexusInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  multiline = false,
  rows = 4,
  required = false,
  helperText,
  icon,
}: NexusInputProps) {
  const baseStyles = `
    w-full px-4 py-3
    bg-input-background border border-input-border rounded-lg
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
    transition-all
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={`${baseStyles} resize-none`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={`${baseStyles} ${icon ? 'pr-10' : ''}`}
          />
        )}
      </div>

      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
