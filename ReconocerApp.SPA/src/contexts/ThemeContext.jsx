import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";


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

  // Obtenemos el color primario guardado o usamos el valor por defecto
  const [primaryColor, setPrimaryColor] = useState('#8b2738');

  // Crear un tema personalizado basado en el color seleccionado y el modo
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: primaryColor,
          },
        },
      }),
    [primaryColor, darkMode],
  );

  // Función para alternar entre modos claro y oscuro
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Valores que estarán disponibles en el contexto
  const value = {
    darkMode,
    toggleTheme,
    primaryColor,
    setPrimaryColor,
    theme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};