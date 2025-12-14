'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Home, Activity, Monitor, Users, UserCircle, ChevronLeft, ChevronRight, X, Table } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MenuItem } from './MenuItem';
import { MenuGroup } from './MenuGroup';

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ className, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    }
  }, []);

  // Save collapse state when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const sidebarContent = (
    <>
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-hover bg-white">
        {!isCollapsed && (
          <div className="flex items-center flex-1">
            <Image
              src="/images/medidea-logo.png"
              alt="Medidea Logo"
              width={200}
              height={70}
              className="max-h-10 w-auto"
              priority
            />
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-primary/10 text-primary hover:text-primary-700 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Close button (mobile only) */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-primary/10 text-primary hover:text-primary-700 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-2">
        {/* Dashboard */}
        <MenuItem
          id="dashboard"
          label="Dashboard"
          icon={Home}
          href="/"
          collapsed={isCollapsed}
        />

        {/* Attività */}
        <MenuItem
          id="attivita"
          label="Attività"
          icon={Activity}
          href="/attivita"
          collapsed={isCollapsed}
        />

        {/* Registro */}
        <MenuItem
          id="registro"
          label="Registro"
          icon={Table}
          href="/registro"
          collapsed={isCollapsed}
        />

        {/* Apparecchiature */}
        <MenuItem
          id="apparecchiature"
          label="Apparecchiature"
          icon={Monitor}
          href="/apparecchiature"
          collapsed={isCollapsed}
        />

        {/* Clienti */}
        <MenuItem
          id="clienti"
          label="Clienti"
          icon={Users}
          href="/clienti"
          collapsed={isCollapsed}
        />

        {/* Utenti */}
        <MenuItem
          id="utenti"
          label="Utenti"
          icon={UserCircle}
          href="/utenti"
          collapsed={isCollapsed}
        />
      </nav>

      {/* Footer info (when not collapsed) */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-sidebar-hover">
          <p className="text-xs text-sidebar-textMuted">
            © 2024 Medidea
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar h-screen sticky top-0 sidebar-transition',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-[backdrop-fade-in_200ms]"
            onClick={onMobileClose}
          />

          {/* Drawer */}
          <aside
            className={cn(
              'lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50 flex flex-col',
              'sidebar-transition',
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
