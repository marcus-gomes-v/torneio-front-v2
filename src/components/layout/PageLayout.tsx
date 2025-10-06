import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageLayout({ children, maxWidth = 'xl' }: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1600px]',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen w-full flex justify-center py-12 px-8 sm:px-12 lg:px-20">
      <div className={`w-full ${maxWidthClasses[maxWidth]}`}>
        {children}
      </div>
    </div>
  );
}
