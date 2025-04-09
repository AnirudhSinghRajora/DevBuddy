import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function MainLayout({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    let initialValue;
    if (storedDarkMode !== null) {
      initialValue = storedDarkMode === 'true';
    } else {
      initialValue = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    console.log('[MainLayout] Initial isDark state:', initialValue);
    return initialValue;
  });

  
  useEffect(() => {
    console.log('[MainLayout] useEffect for isDark running. isDark:', isDark);
    if (isDark) {
      console.log('[MainLayout] Adding dark class');
      document.documentElement.classList.add('dark');
    } else {
      console.log('[MainLayout] Removing dark class');
      document.documentElement.classList.remove('dark');
    }
    
    console.log('[MainLayout] Setting localStorage darkMode to:', isDark.toString());
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]); 

  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      console.log('[MainLayout] System theme changed. New value:', e.matches);
      
      if (localStorage.getItem('darkMode') === null) {
        console.log('[MainLayout] Updating state based on system theme change');
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []); 

  
  const toggleDarkMode = () => {
    console.log('[MainLayout] toggleDarkMode called. Current isDark:', isDark);
    setIsDark(prevIsDark => {
      const nextIsDark = !prevIsDark;
      console.log('[MainLayout] Setting isDark state to:', nextIsDark);
      return nextIsDark;
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">DevBuddy</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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