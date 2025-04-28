import { AppBar, Toolbar, Link, Typography, Box, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import WelcomeName from "./WelcomeName";
import SignInSignOutButton from "./SignInSignOutButton";
import WalletBalance from "./WalletBalance";
import { useMsal } from "@azure/msal-react";
import { useState } from "react";

const NavBar = () => {
  const { accounts } = useMsal();
  const user = accounts[0];
  const oid = user?.idTokenClaims?.oid; // Calculamos el OID aquí

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <div style={{ flexGrow: 1, margin: 0, padding: 0 }}>
      <AppBar position="fixed" color="secondary" style={{ top: 0, left: 0 }}>
        <Toolbar>
          {/* Logo */}
          <img
            src="https://www.udla.edu.ec/assets/logo-white.svg"
            alt="UDLA Logo"
            style={{ width: 50, height: 50, marginRight: 10 }}
          />

          {/* Title */}
          <Typography style={{ flexGrow: 1 }}>
            <Link
              component={RouterLink}
              to="/"
              color="inherit"
              variant="h6"
              underline="none"
            >
              {import.meta.env.VITE_TITLE}
            </Link>
          </Typography>

          {/* Wallet Balance (always visible) */}
          <WalletBalance id={oid} sx={{ mr: 2 }} />

          {/* Menu for larger screens */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
            }}
          >
            <WelcomeName />
            <SignInSignOutButton />
          </Box>

          {/* Hamburger menu for mobile */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
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
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default NavBar;