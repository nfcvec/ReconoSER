import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, CardActions, Typography, Grid, Container, Box } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { getPremios } from "../../utils/services/premios";

export default function Marketplace() {
  const { instance } = useMsal();
  const [prizes, setPrizes] = useState([]); // Aquí se cargarán los premios desde la API

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          console.error("No active account! Please log in.");
          return;
        }

        // Obtener el dominio del correo electrónico
        const email = account.username;
        const domain = email.split("@")[1].toLowerCase(); // Extraer y normalizar el dominio
        console.log("Dominio del usuario:", domain);

        // Obtener premios desde la API
        const premios = await getPremios();
        console.log("Datos de premios obtenidos:", premios);

        // Verificar si los datos son válidos
        if (!Array.isArray(premios)) {
          console.error("Los premios no son un array válido.");
          return;
        }

        // Filtrar premios según el dominio
        const filteredPrizes = premios.filter((premio) => {
          return (
            premio.organizacion &&
            premio.organizacion.dominioEmail &&
            premio.organizacion.dominioEmail.toLowerCase().includes(domain)
          );
        });

        console.log("Premios filtrados:", filteredPrizes);
        setPrizes(filteredPrizes);
      } catch (error) {
        console.error("Error al obtener los premios:", error.message);
      }
    };

    fetchPrizes();
  }, [instance]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
        Marketplace
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Canjea tus ULIs por premios exclusivos.
      </Typography>

      <Grid container spacing={3}>
        {prizes.map((prize) => (
          <Grid item xs={12} sm={6} md={4} key={prize.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {prize.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {prize.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Link to={`/marketplace/${prize.premioId}`} style={{ width: "100%", textDecoration: "none" }}>
                  <Button variant="contained" fullWidth>
                    Seleccionar
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {prizes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No se encontraron premios disponibles.</Typography>
        </Box>
      )}
    </Container>
  );
}