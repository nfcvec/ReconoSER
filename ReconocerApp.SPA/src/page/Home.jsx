import { Link } from "react-router-dom";
import {
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import {
  FileCopy as CertificateIcon,
  Store as MarketplaceIcon,
  EmojiEvents as RecognitionIcon,
  AccountBalanceWallet as WalletIcon,
  Category as CategoryIcon,
  CardGiftcard as PremiosIcon,
  ShoppingCart as ComprasIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useMsal } from "@azure/msal-react";
import { useOrganizacion } from "../contexts/OrganizacionContext";

export default function Home() {
  const { accounts } = useMsal();
  const user = accounts[0];
  const organizacion = useOrganizacion();

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
    {
      title: "ULIs",
      description: "Consulta los saldos de las billeteras de tus colaboradores",
      icon: <WalletIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/wallet-saldos",
      buttonText: "Administrar Saldos",
    },
    {
      title: "Revisar reconocimientos",
      description: "Revisa solicitudes de reconocimientos",
      icon: <AdminIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/reconocimientos",
      buttonText: "Admin. Reconocimientos",
    },
    {
      title: "Revisar compras",
      description: "Revisa solicitudes de compras del marketplace",
      icon: <ComprasIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/marketplace-compras",
      buttonText: "Admin. Compras",
    },
    {
      title: "Administrar Premios",
      description: "Gestiona los premios disponibles",
      icon: <PremiosIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/premios",
      buttonText: "Admin. Premios",
    },
    {
      title: "Administrar Categorías",
      description: "Administra las categorías de los premios",
      icon: <CategoryIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/categorias",
      buttonText: "Admin. Categorías",
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
        padding: "20px",
      }}
    >
      {/* Título principal */}
      <Typography variant="h4">
        <strong>ReconoSER</strong>
        <Typography component="span" variant="h6" sx={{ ml: 1 }}>
          x {organizacion?.nombre || "..."}
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
        justifyContent="center"
        alignItems="stretch"
      >
        {cardItems.map((item) => (
          <Grid item key={item.link} xs={12} sm={6} md={4} lg={3}>
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