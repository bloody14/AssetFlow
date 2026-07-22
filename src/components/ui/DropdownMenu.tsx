import React from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

export const DropdownMenuTrigger = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
};

export const DropdownMenuContent = ({
  children,
  isOpen,
  align = 'right',
}: {
  children: React.ReactNode;
  isOpen: boolean;
  align?: 'left' | 'right';
}) => {
  if (!isOpen) return null;
  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-2 w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
        align === 'right' ? 'right-0' : 'left-0'
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      {children}
    </div>
  );
};

export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => {
  return <div className="px-2 py-1.5 text-sm font-semibold">{children}</div>;
};

export const DropdownMenuSeparator = () => {
  return <div className="-mx-1 my-1 h-px bg-muted" />;
};
