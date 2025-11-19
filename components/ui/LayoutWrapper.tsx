'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Pages that should NOT use the AppLayout (standalone pages)
  const standalonePages = ['/login'];

  // Check if current page is standalone
  const isStandalone = standalonePages.includes(pathname);

  // If standalone page, render children directly
  if (isStandalone) {
    return <>{children}</>;
  }

  // Otherwise, wrap with AppLayout
  return <AppLayout>{children}</AppLayout>;
}
