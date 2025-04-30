import React, { createContext, useState, useContext, useEffect } from 'react';

// Creamos el contexto del tema
export const ThemeContext = createContext();

// Hook personalizado para usar el tema desde cualquier componente
export const useTheme = () => useContext(ThemeContext);

// Proveedor del tema que envuelve la aplicación
export const ThemeProvider = ({ children }) => {
  // Intentamos obtener el tema guardado en localStorage, sino usamos 'light' por defecto
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Guardamos el tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Función para alternar entre modos claro y oscuro
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Valores que estarán disponibles en el contexto
  const value = {
    darkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};