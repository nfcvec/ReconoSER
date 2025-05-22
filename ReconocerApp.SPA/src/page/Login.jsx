import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Typography from "@mui/material/Typography";
import Home from "./Home.jsx";
import { Container, Box } from "@mui/material";
import SignInSignOutButton from "./../ui-components/SignInSignOutButton.jsx";

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
        <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            mt: 4,
            width: '100%',
            justifyContent: 'center',
          }}>
            {/* Imagen rectangular */}
            <Box sx={{
              width: { xs: '100%', md: 700 },
              aspectRatio: { xs: '16/9', md: '16/11' },
              bgcolor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
              borderRadius: 2,
              mb: { xs: 2, md: 0 },
              mr: { xs: 0, md: 2 },
              overflow: 'hidden',
              position: 'relative',
              minWidth: { xs: '100%', md: 700 },
              maxWidth: { xs: '100%', md: 1500 },
              height: 'auto',
              maxHeight: { xs: 10000, md: 900 },
            }}>
              <img 
                src="https://sites-www.udla.edu.ec/sites/default/files/styles/scale_webp_960x540/public/media/high_res_image/2024/09/hero-bgew.png.webp?itok=LKKzFiPk" 
                alt="Bienvenida" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectPosition: 'center',
                  display: 'block',
                }} 
              />
            </Box>
            {/* Rectángulo vertical con botón de inicio de sesión */}
            <Box sx={{
              width: { xs: '100%', md: 400 },
              minHeight: { xs: 180, md: 720 },
              bgcolor: '#fff',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              p: 3,
            }}>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, padding: 2, textAlign: 'center' }}>
                Bienvenidos <br /> a <br /> Reconocer
              </Typography>
              <SignInSignOutButton variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2 }} />
            </Box>
          </Box>
        </Container>
      </UnauthenticatedTemplate>
    </>
  );
}