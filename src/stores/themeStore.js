import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      
      toggleTheme: () => {
        const newTheme = !get().isDark;
        set({ isDark: newTheme });
        
        // Update document class for Tailwind dark mode
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      setTheme: (isDark) => {
        set({ isDark });
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      initializeTheme: () => {
        const { isDark } = get();
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'paypost-theme',
    }
  )
);