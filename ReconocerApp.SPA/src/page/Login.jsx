import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Typography from "@mui/material/Typography";
import Home from "./Home.jsx";
import { Container, Box } from "@mui/material";
import SignInSignOutButton from "./../ui-components/SignInSignOutButton.jsx";
import reconoserConsorcio from '../assets/RECONOCER_CONSORCIO.png';

export function Login() {
  return (
    <>
      <UnauthenticatedTemplate>
        <body style={{ background: 'linear-gradient(135deg, #101828 0%, #6a7282 50%, #1e2939 100%)', minHeight: '100vh', width: '100vw', margin: 0, padding: 0 }}>
          <Box
            sx={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', m: 0, p: 0 }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 1400, mx: 'auto', py: 6 }}>
              <Box
                id="login-img-box"
                sx={{ width: { xs: '100%', md: 900 }, height: { xs: 220, md: 500 }, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}
              >
                <img
                  src={reconoserConsorcio}
                  alt="Bienvenida"
                  id="login-img"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
              <Box
                sx={{width: { xs: '100%', md: 320 }, bgcolor: '#3f4042', boxShadow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2, p: 3, ml: { xs: 0, md: 0 }, mt: { xs: 2, md: 0 }, height: { xs: 'auto', md: 500 }}}
              >
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#fff', p: 2, borderRadius: 1 }}>
                  ¡Bienvenidos <br /> a <br /> Reconocer!
                </Typography>
                <SignInSignOutButton variant="contained" color="primary" size="large" fullWidth sx={{ mt: 2, bgcolor:'#0847f' }} />
              </Box>
            </Box>
          </Box>
        </body>
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <Box sx={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', m: 0, p: 0 }}>
          <Container>
            <Typography variant="h6">
              <Home />
            </Typography>
          </Container>
        </Box>
      </AuthenticatedTemplate>
    </>
  );
}