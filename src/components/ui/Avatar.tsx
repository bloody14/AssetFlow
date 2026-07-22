import React from 'react';
import { cn } from '@/lib/utils';

export const Avatar = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>
      {children}
    </div>
  );
};

export const AvatarImage = ({ src, alt, className }: { src: string; alt?: string; className?: string }) => {
  return <img src={src} alt={alt} className={cn("aspect-square h-full w-full", className)} />;
};

export const AvatarFallback = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}>
      {children}
    </div>
  );
};
