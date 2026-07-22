import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export interface WidgetProps {
  isLoading?: boolean;
}

interface WidgetContainerProps {
  title: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const WidgetContainer = ({
  title,
  icon: Icon,
  action,
  isLoading,
  children,
  className
}: WidgetContainerProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <div className="mt-2">{children}</div>
        )}
      </CardContent>
    </Card>
  );
};
