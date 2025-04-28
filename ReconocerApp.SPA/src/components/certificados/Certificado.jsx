import React from "react";
import { Box, Typography } from "@mui/material";

const Certificado = ({ texto, colaborador }) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {/* Imagen del certificado */}
      <img
        src="../public/certificado.png" // Asegúrate de que la ruta sea correcta
        alt="Certificado"
        style={{ width: "100%", height: "auto" }}
      />

      {/* Texto del certificado */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#000",
          textAlign: "center",
          width: "80%",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Reconocimiento a {colaborador}
        </Typography>
        <Typography variant="body1">{texto}</Typography>
      </Box>
    </Box>
  );
};

export default Certificado;