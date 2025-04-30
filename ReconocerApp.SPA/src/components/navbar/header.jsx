import { Link, useLocation, useNavigate } from "react-router-dom"
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material"
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material"

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  // Don't show back button on home page
  const showBackButton = location.pathname !== "/"

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {showBackButton && (
            <IconButton edge="start" color="inherit" aria-label="volver" onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <IconButton color="inherit" aria-label="inicio">
              <HomeIcon />
            </IconButton>
          </Link>
        </Box>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center", fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeIcon sx={{ mr: 1 }} />
            ULI Rewards
          </Box>
        </Typography>
        <Box sx={{ width: 40 }} /> {/* Spacer for alignment */}
      </Toolbar>
    </AppBar>
  )
}

