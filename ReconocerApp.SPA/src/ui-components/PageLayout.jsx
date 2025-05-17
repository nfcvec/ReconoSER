import Typography from "@mui/material/Typography";
import NavBar from "./NavBar";
import { Container, Box } from "@mui/material";
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '../contexts/ThemeContext';
import { useOrganizacion } from '../contexts/OrganizacionContext';
import { Paper, Button } from '@mui/material';

export const PageLayout = (props) => {
    const { darkMode } = useTheme();
    const { organizacion, dominio, instance } = useOrganizacion();
    // Solo mostrar el mensaje de error si el usuario está logueado (hay una cuenta activa)
    const isLoggedIn = !!instance?.getActiveAccount?.();

    // Creamos el tema basado en el modo actual
    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            // Los colores predeterminados de Material UI se aplicarán automáticamente
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 500,
            },
            h2: {
                fontWeight: 500,
            },
        },
    });

    // Mensaje de error de organización
    if (isLoggedIn && organizacion === null) {
        return (
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                <NavBar />
                <Box sx={{
                    marginTop: '64px',
                    paddingTop: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 'calc(100vh - 64px)'
                }}>
                    <Box
                        component={Paper}
                        elevation={6}
                        sx={{
                            width: '100%',
                            maxWidth: 600,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 5
                        }}
                    >
                        <Typography variant="h4" color="error" fontWeight="bold" gutterBottom>
                            No hay una organización asociada al dominio <b>{dominio}</b>.
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Puedes solicitar agregar la organización o mapear tu usuario a una organización existente.
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            size="large"
                            sx={{ mt: 4, px: 4, py: 2, fontSize: '1.2rem', borderRadius: 2 }}
                            onClick={() => instance.logout()}
                        >
                            Cerrar sesión (Esc)
                        </Button>
                    </Box>
                </Box>
            </MuiThemeProvider>
        );
    }

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline /> {/* Normaliza los estilos y aplica el color de fondo del tema */}
            <NavBar />
            <Box sx={{ 
                marginTop: '64px', // Altura estándar de AppBar en Material UI
                paddingTop: 3      // Añadir algo de padding adicional
            }}>
                <Container>
                    {props.children}
                </Container>
            </Box>
        </MuiThemeProvider>
    );
};