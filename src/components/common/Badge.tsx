import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}: BadgeProps) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-lg';
  
  const variants = {
    default: 'bg-neutral-100 text-neutral-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-accent-100 text-accent-700',
    brand: 'bg-brand-100 text-brand-700'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
