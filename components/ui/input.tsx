import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-warm-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'rounded-lg border bg-white px-4 py-2 text-warm-900 placeholder:text-warm-400 transition-colors focus:outline-none focus:ring-2',
            error
              ? 'border-coral-400 focus:border-coral-500 focus:ring-coral-200'
              : 'border-warm-300 focus:border-primary-500 focus:ring-primary-200',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-coral-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
