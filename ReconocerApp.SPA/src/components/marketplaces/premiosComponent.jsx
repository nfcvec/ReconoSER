import React, { useState, useEffect } from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getPremioImages } from "../../utils/services/premios";
import { useWallet } from "../../contexts/WalletContext";

export default function PremiosComponent({ premio }) {
  const navigate = useNavigate();
  const [imagenUrl, setImagenUrl] = useState(null);
  const { wallet } = useWallet();
  const userBalance = wallet?.saldoActual ?? 0;

  // Cargar la imagen del premio al montar el componente
  useEffect(() => {
    if (premio?.imagenPrincipal) {
      setImagenUrl(`data:image/jpeg;base64,${premio.imagenPrincipal}`); // Convertir el contenido a base64
    } else {
      setImagenUrl("/no-image.jpg"); // Placeholder si no hay imágenes
    }
  }, [premio]);

  const handleCanjear = () => {
    navigate(`/marketplace/${premio.premioId}`); // Redirige a la página de detalles del premio
  };

  const canCanjear = userBalance >= (premio?.costoWallet ?? 0);

  return (
    <Card
      sx={{
        width: 250, // Ancho fijo
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
    >
      <CardMedia
        component="img"
        height="140"
        image={imagenUrl} // Usar la URL de la imagen
        alt={premio?.nombre}
        sx={{
          objectFit: "contain", // Ajustar la imagen sin deformación
        }}
      />
      <CardContent>
        <Typography variant="h6" component="div">
          {premio?.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {premio?.descripcion}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
          Costo: {premio?.costoWallet} ULIs
        </Typography>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCanjear}
            disabled={!canCanjear} // Deshabilitar si no tiene saldo suficiente
          >
            Canjear
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}