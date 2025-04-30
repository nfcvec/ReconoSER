import { Link } from "react-router-dom";
import { Button, Typography, Grid, Container, Box, Card, CardContent, CardActions, CardMedia } from "@mui/material";
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
    <>
      {/* <NavBar oid={oid} /> */}
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
        <Typography variant="h4">
          <strong>ReconoSER</strong>
          <Typography component="span" variant="h6" sx={{ ml: 1 }}>
            x {organization}
          </Typography>
        </Typography>
        {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
        <Typography variant="h6" color="text.secondary" sx={{ px: { xs: 2, md: 2 } }}>
          Recompensa comportamientos institucionales y canjea tus ULIs por premios
        </Typography>

        <Grid
          container
          spacing={4} // Reduced spacing for cards
          direction={{ xs: "column", md: "row" }}
          justifyContent="center"
          alignItems="center"
          wrap="wrap"
        >
          {[
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
          ].map((item, index) => (

              <Card 
                sx={{ 
                  maxWidth: 250, 
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  }
                }}
                elevation={2}
              >
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                    {item.icon}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, justifyContent: 'center' }}>
                  <Link to={item.link} style={{ textDecoration: "none", width: '100%' }}>
                    <Button variant="contained" fullWidth>
                      {item.buttonText}
                    </Button>
                  </Link>
                </CardActions>
              </Card>
          ))}
        </Grid>
      </Box>
    </>
  );
}