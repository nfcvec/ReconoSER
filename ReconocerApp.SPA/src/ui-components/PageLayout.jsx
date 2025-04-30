import Typography from "@mui/material/Typography";
import NavBar from "./NavBar";
import { Container, Box } from "@mui/material";
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '../contexts/ThemeContext';

export const PageLayout = (props) => {
    const { darkMode } = useTheme();

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