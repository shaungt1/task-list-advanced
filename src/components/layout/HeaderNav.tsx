import React from 'react';
import { Menu } from 'lucide-react';
import { Switch } from "../ui/switch";
import { useTheme } from '../../utils/ThemeContext';

interface HeaderNavProps {
  onSidebarToggle: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onSidebarToggle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`flex items-center justify-between px-4 py-3 border-b transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
      <button
        className={`p-2 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-100 text-zinc-700'}`}
        onClick={onSidebarToggle}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-4">
        <span className={`text-sm ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-700'}`}>Dark Mode</span>
        <Switch checked={theme === 'dark'} onCheckedChange={(checked) => {
  console.log('[HeaderNav] Switch toggled. Checked:', checked);
  toggleTheme();
}} />
      </div>
    </header>
  );
};
