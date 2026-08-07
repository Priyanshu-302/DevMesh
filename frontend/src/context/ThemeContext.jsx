import { createContext, useEffect } from 'react';

export const ThemeContext = createContext({ theme: 'dark' });

export function ThemeProvider({ children }) {
  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}
