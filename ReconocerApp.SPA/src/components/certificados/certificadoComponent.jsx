import React, { forwardRef } from "react";
import { Paper, Box, Typography, Divider, Grid } from "@mui/material";
import udlaparkImage from "../../assets/udlapark_entradaprincipal_interior.jpg"; // Importa la imagen

const CertificadoComponent = forwardRef(({
  Certificado,
  Reconocedor,
  Reconocido,
}, ref) => {
  // Filtra los iconos seleccionados
  const texto = Certificado?.texto || "Texto no disponible";

  // Common text shadow style to apply to all typography elements
  const textShadowStyle = {
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
    color: "#fff"
  };

  return (
    <Paper
      ref={ref} // Use the forwarded ref directly
      elevation={3}
      sx={{
        padding: 6,
        width: "720px",
        height: "720px",
        minWidth: "720px",
        minHeight: "720px",
        backgroundImage: `url(${udlaparkImage})`, // Asigna la imagen como fondo
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: "#fff",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
            }}
          >
            ReconoSER
          </Typography>
        </Box>

        {/* Contenido del certificado */}
      <Box
        sx={{
          backgroundColor: "rgba(251, 48, 5, 0.7)",
          borderRadius: 2,
          padding: 4,
          boxShadow: 1,
        }}
      >
        <Box textAlign="center" mb={2}>
          <Typography variant="h6" sx={textShadowStyle}>De {Reconocedor?.displayName || "Reconocedor no encontrado"}</Typography>
        </Box>

        <Box textAlign="center" mb={2}>
          <Typography variant="h6" sx={textShadowStyle}>Para {Reconocido?.displayName || "Colaborador no encontrado"}</Typography>
        </Box>

        <Box textAlign="center" mb={2}>
          <Typography variant="body1" gutterBottom sx={textShadowStyle}>
            Talentos como tú nos enorgullecen y destacamos en ti:
          </Typography>
          <Grid container spacing={2} justifyContent="center" mt={2}>
            {Certificado.comportamientos.map((item, index) => (
              <Grid item xs={4} key={index} textAlign="center">
                <img
                  src={item?.icono}
                  style={{ maxWidth: "80px", maxHeight: "80px" }}
                />
                <Typography variant="body2" sx={{ mt: 1, ...textShadowStyle }}>
                  {item?.nombre}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box textAlign="center" mt={4}>
          <Typography 
            variant="body1" 
            sx={{ 
              fontStyle: "italic", 
              fontWeight: "medium",
              ...textShadowStyle
            }}
          >"{texto}"</Typography>
        </Box>

      </Box>
    </Paper>
  );
});

export default CertificadoComponent;