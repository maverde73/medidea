'use client';

import { useState, useEffect } from 'react';
import { type LucideIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MenuItem } from './MenuItem';

interface MenuItemType {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
}

interface MenuGroupProps {
  id: string;
  label: string;
  icon: LucideIcon;
  children: MenuItemType[];
  collapsed?: boolean;
  defaultOpen?: boolean;
}

export function MenuGroup({
  id,
  label,
  icon: Icon,
  children,
  collapsed = false,
  defaultOpen = false,
}: MenuGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Load saved state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`menu-group-${id}`);
      if (saved !== null) {
        setIsOpen(saved === 'true');
      }
    }
  }, [id]);

  // Save state when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`menu-group-${id}`, String(isOpen));
    }
  }, [isOpen, id]);

  const toggle = () => setIsOpen(!isOpen);

  if (collapsed) {
    // When sidebar is collapsed, show as simple button (will show flyout on hover in future)
    return (
      <button
        className={cn(
          'flex items-center justify-center w-full px-3 py-2 rounded-lg transition-colors',
          'hover:bg-sidebar-hover text-sidebar-text hover:text-white'
        )}
        title={label}
      >
        <Icon size={20} />
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={toggle}
        className={cn(
          'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium',
          'hover:bg-sidebar-hover text-sidebar-text hover:text-white'
        )}
      >
        <Icon size={20} className="shrink-0" />
        <span className="flex-1 text-left truncate">{label}</span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {isOpen && (
        <div className="ml-6 space-y-1 border-l border-sidebar-active pl-2">
          {children.map((item) => (
            <MenuItem key={item.id} {...item} collapsed={false} />
          ))}
        </div>
      )}
    </div>
  );
}
