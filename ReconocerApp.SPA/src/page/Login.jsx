import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Typography from "@mui/material/Typography";
import Home from "./Home.jsx";
import { Container, Box, Button } from "@mui/material";

export function Login() {
  return (
    <>
      <AuthenticatedTemplate>
        <Container>
          <Typography variant="h6">
            <Home />
          </Typography>
        </Container>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', mt: 4, width: '100%', justifyContent: 'center' }}>
            {/* Imagen rectangular */}
            <Box sx={{ flex: 1, minWidth: 1020, height: 720, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2 }}>
              {/* Puedes reemplazar la imagen por una real si tienes una */}
              <img src="https://sites-www.udla.edu.ec/sites/default/files/styles/scale_webp_960x540/public/media/high_res_image/2024/09/hero-bgew.png.webp?itok=LKKzFiPk" alt="Bienvenida" style={{ width: '100%', height: '100%'}} />
            </Box>
            {/* Rectángulo vertical con botón de inicio de sesión */}
            <Box sx={{ width: 920, height: 720, bgcolor: '#fff', boxShadow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, padding: 15, textAlign: 'center' }}>
                Bienvenidos <br />
                   a  <br />
                Reconocer
              </Typography>
              {/* Botón de inicio de sesión, puedes reemplazarlo por el método real de login */}
              <Button variant="contained" color="primary" size="large" onClick={() => window.location.reload()}>
                Iniciar sesión
              </Button>
            </Box>
          </Box>
        </Container>
      </UnauthenticatedTemplate>
    </>
  );
}