import React from 'react';
import { cn } from '@/utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  padding = 'md',
  hoverable = false,
  children,
  ...rest
}) => {
  const padMap = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
    none: 'p-0',
  };
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-navy-100 shadow-card',
        padMap[padding],
        hoverable ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : '',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...rest }) => (
  <div className={cn('mb-4 flex items-center justify-between', className)} {...rest}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...rest }) => (
  <h3 className={cn('font-display font-semibold text-lg text-navy-900', className)} {...rest}>
    {children}
  </h3>
);

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody: React.FC<CardBodyProps> = ({ className, children, ...rest }) => (
  <div className={cn('', className)} {...rest}>
    {children}
  </div>
);
