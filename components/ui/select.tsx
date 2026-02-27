import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-warm-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'rounded-lg border bg-white px-4 py-2 text-warm-900 transition-colors focus:outline-none focus:ring-2',
            error
              ? 'border-coral-400 focus:border-coral-500 focus:ring-coral-200'
              : 'border-warm-300 focus:border-primary-500 focus:ring-primary-200',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-coral-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
