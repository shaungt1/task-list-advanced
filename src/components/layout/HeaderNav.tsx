import React from 'react';
import { Menu } from 'lucide-react';
import { Switch } from "../ui/switch";
import { useTheme } from '../../utils/ThemeContext';

interface NavLink {
  label: string;
  key: string;
  active: boolean;
  onClick: () => void;
}

interface HeaderNavProps {
  onSidebarToggle: () => void;
  navLinks: NavLink[];
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onSidebarToggle, navLinks }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`flex items-center justify-between px-4 py-3 border-b transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
      <div className="flex items-center gap-2">
        <button
          className={`p-2 rounded transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-100 text-zinc-700'}`}
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        <nav className="ml-4 flex gap-2">
          {navLinks.map(link => (
            <button
              key={link.key}
              onClick={link.onClick}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                link.active
                  ? theme === 'dark'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'bg-zinc-200 text-zinc-900'
                  : theme === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-400'
                  : 'hover:bg-zinc-100 text-zinc-700'
              }`}
              aria-current={link.active ? 'page' : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
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
