import React, { useRef } from "react";
import { Paper, Box, Typography, Divider, Grid } from "@mui/material";
import iconos from "../../constants/iconos.js";
import udlaparkImage from "../../assets/udlapark_entradaprincipal_interior.jpg"; // Importa la imagen

export default function CertificadoComponent({
  nombreColaborador,
  fechaActual,
  titulo,
  texto,
  justificacion,
  oid,
  setRef, // Nueva prop para pasar la referencia al componente padre
}) {
  const certificadoRef = useRef(null);

  // Pasamos la referencia al componente padre
  React.useEffect(() => {
    if (setRef) {
      setRef(certificadoRef);
    }
  }, [setRef]);

  const colaborador = nombreColaborador || `Colaborador con ID: ${oid}`;
  const comportamientos = titulo.split(",").map((c) => c.trim());
  const iconosSeleccionados = comportamientos
    .map((comportamiento) => ({
      icono: iconos[comportamiento]?.fuente,
      titulo: comportamiento,
    }))
    .filter((item) => item.icono);

  return (
    <Paper
      ref={certificadoRef} // Asignamos la referencia al contenedor principal
      elevation={3}
      sx={{
        padding: 6,
        maxWidth: "800px",
        margin: "auto",
        backgroundColor: "#fff",
        backgroundImage: `url(${udlaparkImage})`, // Asigna la imagen como fondo
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#000",
      }}
    >
      {/* Título principal */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" fontWeight="bold" color="primary">
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
        <Box textAlign="center" mb={4}>
          <Typography variant="subtitle1">Otorgado a:</Typography>
          <Typography variant="h5" fontWeight="bold">{colaborador}</Typography>
        </Box>

        <Box textAlign="center" mb={4}>
          <Typography variant="body1">
            Por demostrar de manera sobresaliente los valores de nuestra organización:
          </Typography>
          <Grid container spacing={2} justifyContent="center" mt={2}>
            {iconosSeleccionados.map((item, index) => (
              <Grid item xs={4} key={index} textAlign="center">
                <img
                  src={item.icono}
                  alt={`Icono ${index}`}
                  style={{ maxWidth: "80px", maxHeight: "80px" }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {item.titulo}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box textAlign="center" mt={4}>
          <Typography variant="body1" sx={{ fontStyle: "italic" }}>{texto}</Typography>
        </Box>

        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="textSecondary">
            Justificación: {justificacion}
          </Typography>
        </Box>

        <Box textAlign="center" mt={6}>
          <Typography variant="body2" color="textSecondary">
            Fecha: {fechaActual}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}