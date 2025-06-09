import React, { forwardRef } from "react";
import { Paper, Box, Typography, Divider, Grid, SvgIcon } from "@mui/material";
import { useOrganizacion } from "../../contexts/OrganizacionContext";
import logo1 from '../../assets/Aplicativo.svg';


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
      {organizacion?.iconSvg && (
        <Paper
          elevation={3}
          sx={{
            backgroundColor: 'primary.main',
            p: 2,
            // mb: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: { xs: '75vw', sm: '75vw', md: '400px' },
            maxWidth: '400px',
            minWidth: 0,
            mx: 'auto',
            color: '#fff',
            '& svg': {
              width: '100%',
              height: 'auto',
              display: 'block',
              maxWidth: '400px',
              margin: '0 auto',
            },
          }}
        >
          <Box
            sx={{ width: '100%' }}
            dangerouslySetInnerHTML={{
              __html: organizacion.iconSvg
            }}
          />
        </Paper>
      )}

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
          <Grid container spacing={3} justifyContent="center" mt={2}>
            {Certificado?.comportamientos.map(({ iconSvg, nombre }, idx) => (
              <Grid item xs={3} key={idx} textAlign="center" display="flex" flexDirection="column" alignItems="center">
                {iconSvg && (
                  <Box component={Paper}
                    sx={{
                      width: "80px",
                      height: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      borderRadius: 1,
                      boxShadow: 1,
                      margin: "0 auto",
                    }}
                  >
                    <span
                      style={{ width: "80px", height: "80px" }}
                      dangerouslySetInnerHTML={{ __html: iconSvg.replace('<svg', '<svg width="80px" height="80px" color="#ffffff" preserveAspectRatio="xMidYMid meet"') }}
                    />
                  </Box>
                )}
                <Typography variant="body1" sx={{ mt: 1, ...textShadowStyle, fontSize: '1.1rem' }}>
                  {nombre}
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