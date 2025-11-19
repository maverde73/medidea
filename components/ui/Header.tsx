'use client';

import { Menu } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { UserDropdown } from './UserDropdown';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onMenuToggle?: () => void;
}

export function Header({ userName, userEmail, onMenuToggle }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left section: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Hamburger menu for mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} className="text-gray-700" />
        </button>

        {/* Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Right section: User dropdown */}
      <UserDropdown userName={userName} userEmail={userEmail} />
    </header>
  );
}
