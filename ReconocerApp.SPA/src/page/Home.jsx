import { Link } from "react-router-dom";
import { Button, Typography, Grid, Container, Box } from "@mui/material";
import {
  FileCopy as CertificateIcon,
  Store as MarketplaceIcon,
  EmojiEvents as RecognitionIcon,
} from "@mui/icons-material";
import { useMsal } from "@azure/msal-react";
import NavBar from "../ui-components/NavBar";

export default function Home() {
  const { accounts } = useMsal();
  const user = accounts[0];

  const getOrganizationFromEmail = (email) => {
    const domain = email.split("@")[1];
    if (domain === "udla.edu.ec") {
      return "UDLA";
    }
    return "Organización Desconocida";
  };

  const organization = getOrganizationFromEmail(user.username);
  const oid = user.idTokenClaims.oid;

  return (
    <Container maxWidth="lg" sx={{ py: 8, px: { xs: 2, sm: 4, md: 8 } }}>
      <NavBar oid={oid} />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
        Organización: <strong>{organization}</strong>
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          gap: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
          Bienvenido a ReconoSER
        </Typography>
        <pre>{JSON.stringify(user, null, 2)}</pre>
        <Typography variant="h6" color="text.secondary" sx={{ px: { xs: 2, md: 2 } }}>
          Recompensa comportamientos institucionales y canjea tus ULIs por premios
        </Typography>

        <Grid
          container
          spacing={10} // Espaciado uniforme entre elementos
          direction={{ xs: "column", md: "row" }} // Vertical en móviles, horizontal en PC
          justifyContent="center" // Centra los elementos en ambas vistas
          alignItems="center"
          wrap="wrap" // Permite envolver en móviles, evita en PC
          sx={{
            px: { xs: 2, sm: 4, md: 6 }, // Espaciado horizontal dinámico
          }}
        >
          {[
            {
              title: "Mis Certificados",
              description: "Visualiza y descarga tus certificados de comportamientos",
              icon: <CertificateIcon sx={{ fontSize: 64, color: "primary.main" }} />,
              link: "/certificados",
              buttonText: "Ver Certificados",
            },
            {
              title: "Reconocimiento",
              description: "Evalúa valores institucionales de tus colaboradores",
              icon: <RecognitionIcon sx={{ fontSize: 64, color: "primary.main" }} />,
              link: "/reconocimiento",
              buttonText: "Dar Reconocimiento",
            },
            {
              title: "Marketplace",
              description: "Canjea tus ULIs por premios exclusivos",
              icon: <MarketplaceIcon sx={{ fontSize: 64, color: "primary.main" }} />,
              link: "/marketplace",
              buttonText: "Ir al Marketplace",
            },
          ].map((item, index) => (
            <Grid
              item
              xs={12} // Ocupa todo el ancho en móviles
              sm={6} // Ocupa la mitad del ancho en tablets
              md={4} // Ocupa un tercio del ancho en PC
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                mx: "auto", // Centra automáticamente los elementos horizontalmente
              }}
            >
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: { xs: 280, sm: 300, md: 300 }, // Ajusta el ancho máximo dinámicamente
                  mx: "auto", // Centra automáticamente el contenedor
                }}
              >
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.description}
                  </Typography>
                  <Box sx={{ py: 3 }}>{item.icon}</Box>
                </Box>
                <Link to={item.link} style={{ textDecoration: "none" }}>
                  <Button variant="contained" fullWidth>
                    {item.buttonText}
                  </Button>
                </Link>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}