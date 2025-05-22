import React, { forwardRef } from "react";
import { Paper, Box, Typography, Divider, Grid } from "@mui/material";
import udlaparkImage from "../../assets/udlapark_entradaprincipal_interior.jpg"; // Importa la imagen
import { useOrganizacion } from "../../contexts/OrganizacionContext";

const CertificadoComponent = forwardRef(({
  Certificado,
  Reconocedor,
  Reconocido,
}, ref) => {

  const { organizacion } = useOrganizacion();
  // Filtra los iconos seleccionados
  const texto = Certificado?.texto || "Texto no disponible";

  // Common text shadow style to apply to all typography elements
  const textShadowStyle = {
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
    color: "#fff"
  };

  return (
    <Paper
      ref={ref}
      elevation={3}
      sx={{
        p: 2,
        width: "720px",
        minWidth: "720px",
        minHeight: "720px",
        backgroundColor: "primary.main",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box textAlign="center" mb={2}>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={textShadowStyle}
        >
          ReconoSER
        </Typography>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={textShadowStyle}
        >
          {organizacion.descripcion}
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: 2,
          padding: 2,
          boxShadow: 1,
        }}
      >
        <Box textAlign="center" mb={2}>
          <Typography variant="h6" sx={textShadowStyle}>
            De <strong>{Reconocedor?.displayName || "Reconocedor no encontrado"}</strong>
          </Typography>
        </Box>

        <Box textAlign="center" mb={2}>
          <Typography variant="h5" sx={textShadowStyle}>
            Para <strong>{Reconocido?.displayName || "Colaborador no encontrado"}</strong>
          </Typography>
        </Box>

        <Box textAlign="center" mb={2}>
          <Typography variant="body1" gutterBottom sx={textShadowStyle}>
            Talentos como tú nos enorgullecen y destacamos en ti:
          </Typography>
          <Grid container spacing={2} justifyContent="center" mt={2}>
            {(Certificado?.comportamientos || []).map((item, index) => (
              <Grid item xs={4} key={index} textAlign="center">
                {item?.iconSvg && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 60,
                      height: 60,
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid #eee',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      marginBottom: 8,
                      overflow: 'hidden',
                    }}
                    dangerouslySetInnerHTML={{ __html: (item.iconSvg || '').replace('<svg', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet"') }}
                  />
                )}
                <Typography variant="body2" sx={{ mt: 1, ...textShadowStyle }}>
                  {item?.nombre}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box textAlign="center" mt={2}>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              fontWeight: "medium",
              ...textShadowStyle,
            }}
          >
            "{texto}"
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
});

export default CertificadoComponent;