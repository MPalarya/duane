import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-200',
  secondary:
    'bg-accent-100 text-accent-800 hover:bg-accent-200 focus:ring-accent-200',
  outline:
    'border border-warm-300 bg-transparent text-warm-700 hover:bg-warm-50 focus:ring-warm-200',
  ghost:
    'bg-transparent text-warm-600 hover:bg-warm-100 hover:text-warm-900 focus:ring-warm-200',
  danger:
    'bg-coral-500 text-white hover:bg-coral-400 focus:ring-coral-200',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
