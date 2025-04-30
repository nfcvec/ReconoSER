import { AppBar, Toolbar, Link, Typography, Box, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import HomeIcon from '@mui/icons-material/Home';
import WelcomeName from "./WelcomeName";
import SignInSignOutButton from "./SignInSignOutButton";
import WalletBalance from "./WalletBalance";
import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { useTheme } from '../contexts/ThemeContext';

const NavBar = () => {
  const { accounts } = useMsal();
  const user = accounts[0];
  const oid = user?.idTokenClaims?.oid; // Calculamos el OID aquí
  const { darkMode, toggleTheme } = useTheme(); // Acceder al contexto de tema

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

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

          {/* Menú para pantallas grandes (a la derecha) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
            }}
          >
            <WelcomeName />
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

          {/* Botones para pantallas pequeñas (a la derecha) */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            {/* Theme toggle button */}
            <IconButton 
              color="inherit"
              onClick={toggleTheme}
              aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            {/* Hamburger menu for mobile */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile menu */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem>
              <WelcomeName />
            </ListItem>
            <ListItem>
              <SignInSignOutButton />
            </ListItem>
            <ListItem button onClick={toggleTheme}>
              <IconButton color="inherit">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <ListItemText primary={darkMode ? "Modo Claro" : "Modo Oscuro"} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default NavBar;