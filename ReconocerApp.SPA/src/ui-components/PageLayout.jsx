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
    const { organizacion, dominio, instance, loading, error } = useOrganizacion();
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

    // Mostrar loading mientras se obtiene la organización
    if (loading) {
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
                    <Typography variant="h5">Cargando organización...</Typography>
                </Box>
            </MuiThemeProvider>
        );
    }

    // Mostrar error si ocurre
    if (error) {
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
                    <Box component={Paper} sx={{ p: 4, borderRadius: 2, boxShadow: 3, maxWidth: 600 }}>
                        <Typography variant="h5" color="error" gutterBottom>
                            {error}
                        </Typography>
                        <Button onClick={() => instance.logout()}>Cerrar sesión</Button>
                    </Box>
                </Box>
            </MuiThemeProvider>
        );
    }

    // Mensaje de error de organización SOLO si ya no está cargando y no hay error
    if (isLoggedIn && organizacion === null && !loading && !error) {
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
                        display={'flex'}
                        flexDirection={'column'}
                        sx={{
                            padding: 4,
                            borderRadius: 2,
                            boxShadow: 3,
                            backgroundColor: theme.palette.background.paper,
                            width: '100%',
                            maxWidth: '600px',
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            No hay una organización asociada al dominio <b>{dominio}</b>.
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Puedes solicitar agregar la organización como nueva, o agregar tu usuario a una organización existente.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Tu id de usuario es: <b>{instance.getActiveAccount()?.idTokenClaims?.oid}</b>
                        </Typography>
                        <Button
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