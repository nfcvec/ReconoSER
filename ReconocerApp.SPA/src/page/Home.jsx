import { Link } from "react-router-dom";
import {
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Button, // Importar Button desde Material-UI
} from "@mui/material";
import {
  FileCopy as CertificateIcon,
  Store as MarketplaceIcon,
  EmojiEvents as RecognitionIcon,
} from "@mui/icons-material";
import { useMsal } from "@azure/msal-react";
import Administrar from "../components/administrar/administrar"; // Importar el componente Administrar

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

  const cardItems = [
    {
      title: "Mis Certificados",
      description: "Visualiza y descarga tus certificados",
      icon: <CertificateIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/certificados",
      buttonText: "Ver Certificados",
    },
    {
      title: "Reconocer",
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
  ];

  return (
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
      {/* Renderizar el componente Administrar directamente */}
      <Box sx={{ width: "100%", mb: 4 }}>
        <Administrar />
      </Box>

      {/* Título principal */}
      <Typography variant="h4">
        <strong>ReconoSER</strong>
        <Typography component="span" variant="h6" sx={{ ml: 1 }}>
          x {organization}
        </Typography>
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ px: { xs: 2, md: 2 } }}
      >
        Recompensa comportamientos institucionales y canjea tus ULIs por premios
      </Typography>

      <Grid
        container
        spacing={4}
        direction={{ xs: "column", md: "row" }}
        justifyContent="center"
        alignItems="center"
      >
        {cardItems.map((item) => (
          <Grid item key={item.link}>
            <Card
              sx={{
                maxWidth: 250,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
              elevation={2}
            >
              <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {item.description}
                </Typography>
                <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
                  {item.icon}
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, justifyContent: "center" }}>
                <Link
                  to={item.link}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <Button variant="contained" fullWidth>
                    {item.buttonText}
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}