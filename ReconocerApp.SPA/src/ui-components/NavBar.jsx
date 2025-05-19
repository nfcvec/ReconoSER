import { AppBar, Toolbar, Link, Typography, Box, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HomeIcon from '@mui/icons-material/Home';
import WelcomeName from "./WelcomeName";
import SignInSignOutButton from "./SignInSignOutButton";
import WalletBalance from "./WalletBalance";
import { useMsal } from "@azure/msal-react";
import { useTheme } from '../contexts/ThemeContext';

const NavBar = () => {
  const { instance } = useMsal();
  const user = instance.getActiveAccount();
  const oid = user?.idTokenClaims?.oid; // Calculamos el OID aquí
  const { darkMode, toggleTheme } = useTheme(); // Acceder al contexto de tema

  return (
    <Box style={{ flexGrow: 1, margin: 0, padding: 0 }}>
      <AppBar position="fixed" style={{ top: 0, left: 0 }}>
        <Toolbar>
          {/* Home Icon */}
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/"
            aria-label="Inicio"
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
          
          {/* Wallet Balance (siempre visible a la izquierda) */}
          <WalletBalance id={oid} sx={{ mr: 2 }} />

          {/* Espaciador para empujar los elementos a la derecha */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Componentes siempre visibles a la derecha */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <WelcomeName />
            </Box>
            <SignInSignOutButton />
            {/* Theme toggle button */}
            <IconButton 
              color="inherit"
              onClick={toggleTheme}
              sx={{ ml: 1 }}
              aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;