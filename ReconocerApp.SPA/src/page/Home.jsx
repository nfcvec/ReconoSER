import { Link } from "react-router-dom";
import {
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
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
  const { instance } = useMsal();
  const user = instance.getActiveAccount();
  const { organizacion } = useOrganizacion();

  // Obtener roles del usuario
  const roles = user?.idTokenClaims?.roles || [];
  const isAdmin = roles.some(r => r.toLowerCase() === "admin" || r.toLowerCase() === "administrador");
  const isApprover = roles.some(r => r.toLowerCase() === "aprobador");

  const cardItems = [
    {
      title: "Mis Certificados",
      description: "Visualiza y descarga tus certificados",
      icon: <CertificateIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/certificados",
      buttonText: "Ver Certificados",
      menu: "main",
    },
    {
      title: "Reconocer",
      description: "Evalúa valores institucionales de tus colaboradores",
      icon: <RecognitionIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/reconocimiento",
      buttonText: "Dar Reconocimiento",
      menu: "main",
    },
    {
      title: "Marketplace",
      description: "Canjea tus ULIs por premios exclusivos",
      icon: <MarketplaceIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/marketplace",
      buttonText: "Ir a canjear",
      menu: "main",
    },
    {
      title: "ULIs",
      description: "Consulta los saldos de las billeteras de tus colaboradores",
      icon: <WalletIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/wallet-saldos",
      buttonText: "Ir a billeteras",
      menu: "approver",
    },
    {
      title: "Revisar reconocimientos",
      description: "Revisa solicitudes de reconocimientos",
      icon: <AdminIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/reconocimientos",
      buttonText: "Ir a reconocimientos",
      menu: "approver",
    },
    {
      title: "Revisar compras",
      description: "Revisa solicitudes de compras del marketplace",
      icon: <ComprasIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/marketplace-compras",
      buttonText: "Ir a compras",
      menu: "approver",
    },
    {
      title: "Administrar Premios",
      description: "Gestiona los premios disponibles",
      icon: <PremiosIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/premios",
      buttonText: "Ir a premios",
      menu: "admin",
    },
    {
      title: "Administrar Categorías",
      description: "Administra las categorías de los premios",
      icon: <CategoryIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/categorias",
      buttonText: "Ir a categorías",
      menu: "admin",
    },
    {
      title: "Administrar Comportamientos",
      description: "Gestiona los comportamientos de la organización",
      icon: <RecognitionIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/comportamientos",
      buttonText: "Ir a comportamientos",
      menu: "admin",
    },
    {
      title: "Administrar Organizaciones",
      description: "Gestiona las organizaciones del sistema",
      icon: <AdminIcon sx={{ fontSize: 64, color: "primary.main" }} />,
      link: "/administrar/organizaciones",
      buttonText: "Ir a organizaciones",
      menu: "admin",
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
      {organizacion?.iconSvg && (
        <span
          style={{ display: "inline-block", verticalAlign: "middle", width: 96, height: 96 }}
          dangerouslySetInnerHTML={{ __html: organizacion.iconSvg }}
        />
      )}
      
      {/* Título principal */}
      <Typography variant="h4">

        <Typography component="span" variant="h6" sx={{ ml: 1 }}>
          x {organizacion?.nombre || "..."}
        </Typography>
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ px: { xs: 2, md: 2 }, mb: 4 }}
      >
        Reconoce lo extraordinario, gana ULIs y cámbialos por premios que te sorprenderán.
      </Typography>
      {/* <pre>{JSON.stringify(user.idTokenClaims.roles)}</pre>  */}
      {/*<pre>{JSON.stringify(user, null, 2)}</pre>*/}

      {/* Menú principal */}
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {cardItems.filter(i => i.menu === "main").map((item) => (
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

      {/* Menú de aprobadores */}
      {(isApprover || isAdmin) && (
        <Box sx={{ width: '100%' }}>
          <Divider sx={{ width: '100%' }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Menú de aprobadores</Typography>
          <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: 4 }}>
            {cardItems.filter(i => i.menu === "approver").map((item) => (
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
      )}

      {/* Menú de administración */}
      {isAdmin && (
        <Box sx={{ width: '100%' }}>
          <Divider sx={{ width: '100%' }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Menú de administración</Typography>
          <Grid container spacing={4} justifyContent="center" alignItems="stretch" sx={{ mb: 4 }}>
            {cardItems.filter(i => i.menu === "admin").map((item) => (
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
      )}
    </Box>
  );
}