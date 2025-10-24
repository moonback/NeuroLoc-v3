import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon: LeftIcon, rightIcon: RightIcon, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <LeftIcon className="h-4 w-4 text-neutral-400" />
            </div>
          )}
          
          <input
            ref={ref}
            className={`input ${LeftIcon ? 'pl-10' : ''} ${RightIcon ? 'pr-10' : ''} ${
              error ? 'border-accent-500 focus:ring-accent-500' : ''
            } ${className}`}
            {...props}
          />
          
          {RightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <RightIcon className="h-4 w-4 text-neutral-400" />
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-2">
            {error && (
              <p className="text-sm text-accent-600">{error}</p>
            )}
            {helperText && !error && (
              <p className="text-sm text-neutral-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
