import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function MainLayout({ children }) {
  const [isDark, setIsDark] = useState(false);

  
  useEffect(() => {
    
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    
    const shouldBeDark = storedDarkMode !== null ? storedDarkMode : prefersDark;
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">DevBuddy</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {isDark ? 
              <FiSun className="text-yellow-400 w-5 h-5" /> : 
              <FiMoon className="text-gray-700 dark:text-gray-400 w-5 h-5" />
            }
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} DevBuddy - Your coding companion
        </div>
      </footer>
    </div>
  );
} 