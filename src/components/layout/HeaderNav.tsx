import React from 'react';
import { Menu } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useTheme } from '../../utils/ThemeContext';

interface HeaderNavProps {
  onSidebarToggle: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onSidebarToggle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <button
        className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        onClick={onSidebarToggle}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-700 dark:text-zinc-200">Dark Mode</span>
        <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
      </div>
    </header>
  );
};
