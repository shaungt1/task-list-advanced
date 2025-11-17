import { useTheme } from '../../utils/ThemeContext';

export function Footer() {
  const { theme } = useTheme();
  return (
    <footer className={`text-center p-4 transition-colors ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-50 text-zinc-700'}`}>
      <div className="flex flex-col items-center gap-2">
        <a
          href="https://astrobot.ai"
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold underline underline-offset-4 transition-colors ${theme === 'dark' ? 'text-blue-300 hover:text-blue-100' : 'text-blue-700 hover:text-blue-500'}`}
        >
          astrobot.ai
        </a>
      </div>
    </footer>
  );
}