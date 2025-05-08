import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PremiosComponent({ imagenUrl, nombre, descripcion, costoWallet, canAfford, premioId }) {
  const navigate = useNavigate();

  const handleCanjear = () => {
    navigate(`/marketplace/${premioId}`); // Redirige a la página de detalles del premio
  };

  return (
    <Card
      sx={{
        width: 250, // Cambiado para mantener un ancho fijo
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6
        }
      }}
    >
      <CardMedia component="img" height="140" image={imagenUrl} alt={nombre} />
      <CardContent>
        <Typography variant="h6" component="div">
          {nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {descripcion}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
          Costo: {costoWallet} ULIs
        </Typography>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCanjear}
            disabled={!canAfford} // Deshabilitar si no tiene saldo suficiente
          >
            Canjear
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}