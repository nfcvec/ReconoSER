import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Typography from "@mui/material/Typography";
import Home from "./Home.jsx";
import { Container } from "@mui/material";

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
        <Typography variant="h6">
          <center>¡Hola! Debes iniciar sesión para continuar...</center>
        </Typography>
      </UnauthenticatedTemplate>
    </>
  );
}