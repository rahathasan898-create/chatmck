
import React from 'react';
import { Briefcase, User, Shield } from 'lucide-react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badgeIcon?: 'briefcase' | 'user' | 'shield';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', badgeIcon, onClick }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const badgeSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const getBadgeColor = () => {
    switch (badgeIcon) {
      case 'briefcase': return 'bg-brand-600';
      case 'shield': return 'bg-indigo-600';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="relative inline-block cursor-pointer" onClick={onClick}>
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover border border-zinc-100 shadow-sm`}
      />
      {badgeIcon && (
        <div className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-white ${getBadgeColor()} ${badgeSizeClasses[size]} text-white`}>
          {badgeIcon === 'briefcase' && <Briefcase size={size === 'sm' ? 8 : 12} strokeWidth={3} />}
          {badgeIcon === 'user' && <User size={size === 'sm' ? 8 : 12} strokeWidth={3} />}
          {badgeIcon === 'shield' && <Shield size={size === 'sm' ? 8 : 12} strokeWidth={3} />}
        </div>
      )}
    </div>
  );
};
