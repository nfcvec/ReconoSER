import React, { forwardRef } from "react";
import { Paper, Box, Typography, Divider, Grid } from "@mui/material";
import certificadoBg from "../../assets/RECONOCER.jpg";
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
        p: 0, // Sin padding para que el contenido ocupe todo el fondo
        width: 'auto',
        minWidth: 'unset',
        minHeight: 'unset',
        aspectRatio: '1365/2048', // Relación de aspecto de la imagen proporcionada
        backgroundImage: `url(${certificadoBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          backgroundColor: "#e82020",
          borderRadius: 2,
          padding: 2,
          boxShadow: 1,
          // Asegúrate de que el fondo sea opaco y no el texto
        }}
      >
        <Box textAlign="left" mb={2}>
          <Typography variant="h4" sx={textShadowStyle}>
            ¡Felicitaciones!
          </Typography>
          <Typography variant="body1" sx={textShadowStyle}>
            Talentos como tú nos enorgullecen y destacamos en ti:
          </Typography>
        </Box>
        <Box textAlign="center" mb={2}>
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
        <Box display="flex" justifyContent="center" alignItems="center" mb={2} sx={{ background: 'rgba(0,0,0,0.5)', borderRadius: 2, p: 1 }}>
          <Typography variant="h6" sx={{ ...textShadowStyle, mr: 2 }}>
            De <strong>{Reconocedor?.displayName || "Reconocedor no encontrado"}</strong>
          </Typography>
          <Typography variant="h6" sx={{ ...textShadowStyle, ml: 2 }}>
            Para <strong>{Reconocido?.displayName || "Colaborador no encontrado"}</strong>
          </Typography>
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