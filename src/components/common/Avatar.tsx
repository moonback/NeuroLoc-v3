import { ReactNode } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: ReactNode;
}

export const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '',
  children 
}: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className={`${sizes[size]} rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold overflow-hidden ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt || name || 'Avatar'} 
          className="w-full h-full object-cover"
        />
      ) : children ? (
        children
      ) : name ? (
        getInitials(name)
      ) : (
        '?'
      )}
    </div>
  );
};