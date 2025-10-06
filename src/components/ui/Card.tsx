import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const hoverClasses = hover ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : '';

  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10 ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-5 sm:px-6 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-base font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-5 sm:p-6 ${className}`}>{children}</div>;
}
