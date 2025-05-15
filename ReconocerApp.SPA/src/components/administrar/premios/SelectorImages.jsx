import React from "react";
import { Box, Typography, Card, CardContent, CardMedia } from "@mui/material";

const SelectorImagen = ({ imageData }) => {
  if (!imageData) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          No hay imagen disponible, agrege una imagen para el premio.
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 345, mt: 2 }}>
      <CardMedia
        component="img"
        image={imageData.content}
        alt={imageData.name}
        sx={{
          height: 200,          // Fija la altura
          width: "100%",        // Ancho completo del card
          objectFit: "contain", // Ajusta la imagen sin deformación
          borderRadius: "4px"   // Suaviza las esquinas
        }}
      />
      <CardContent>
        <Typography variant="body1" sx={{ fontWeight: "bold", textAlign: "center" }}>
          Imagen: {imageData.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SelectorImagen;
