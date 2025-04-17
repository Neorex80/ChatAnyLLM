import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const ThemeSwitcher: React.FC = () => {
  const { darkMode, toggleDarkMode } = useSettings();
  
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-[var(--color-text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--color-surface-hover)] transition-colors"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun size={18} className="transition-transform duration-300 ease-in-out hover:rotate-45" />
      ) : (
        <Moon size={18} className="transition-transform duration-300 ease-in-out hover:rotate-12" />
      )}
    </button>
  );
};

export default ThemeSwitcher;