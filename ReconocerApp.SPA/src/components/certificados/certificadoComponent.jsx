import React, { forwardRef } from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import certificadoBg from "../../assets/RECONOCER.jpg";
import { useOrganizacion } from "../../contexts/OrganizacionContext";

const redBgStyle = {
  width: '100%',
  backgroundColor: 'rgba(232,32,32,0.7)',
  borderRadius: 2,
  boxShadow: 1,
};
const textShadowStyle = {
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
  color: "#fff"
};
const iconStyle = {
  display: 'inline-block',
  width: 60,
  height: 60,
  background: '#fff',
  borderRadius: 8,
  border: '1px solid #eee',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  marginBottom: 8,
  overflow: 'hidden',
};

const CertificadoComponent = forwardRef(({
  Certificado = {},
  Reconocedor = {},
  Reconocido = {},
}, ref) => {
  useOrganizacion();
  const texto = Certificado.texto || "Texto no disponible";
  const comportamientos = Certificado.comportamientos || [];

  return (
    <Paper
      ref={ref}
      elevation={3}
      sx={{
        p: 0,
        width: '90%', // Reducido para que sea más pequeño
        height: 'auto',
        maxWidth: '400px', // Más pequeño para que se vea todo el certificado
        aspectRatio: '1365/2048',
        backgroundImage: `url(${certificadoBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        margin: '0 auto',
      }}
    >
      <Box sx={{ ...redBgStyle, py: 0.5, px: { xs: 1, md: 2 } }}>
        <Typography variant="h4" sx={{ ...textShadowStyle, fontSize: '1.1rem' }}>
          ¡Felicitaciones!
        </Typography>
        <Typography variant="body1" sx={{ ...textShadowStyle, fontSize: '0.9rem' }}>
          Talentos como tú nos enorgullecen y destacamos en ti:
        </Typography>
      </Box>
      <Box textAlign="center" sx={{ ...redBgStyle, py: 0.5, px: { xs: 1, md: 2 } }}>
        <Grid container spacing={2} justifyContent="center" mt={2}>
          {comportamientos.map(({ iconSvg, nombre }, idx) => (
            <Grid item xs={4} key={idx} textAlign="center">
              {iconSvg && (
                <span
                  style={iconStyle}
                  dangerouslySetInnerHTML={{ __html: iconSvg.replace('<svg', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet"') }}
                />
              )}
              <Typography variant="body2" sx={{ mt: 1, ...textShadowStyle, fontSize: '0.8rem' }}>
                {nombre}  
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%', background: 'rgba(0,0,0,0.7)', borderRadius: 2, p: 0.5 }}>
        <Typography variant="h6" sx={{ ...textShadowStyle, fontSize: '0.95rem' }}>
          De: {Reconocedor.displayName || "Reconocedor no encontrado"}
        </Typography>
        <Typography variant="h6" sx={{ ...textShadowStyle, fontSize: '0.95rem' }}>
          Para: {Reconocido.displayName || "Colaborador no encontrado"}
        </Typography>
      </Box>
      <Box textAlign="center" sx={{ ...redBgStyle, py: 0.5, px: { xs: 1, md: 1 } }}>
        <Typography
          variant="body2"
          sx={{ fontStyle: "italic", fontWeight: "medium", ...textShadowStyle, fontSize: '0.8rem' }}
        >
          "{texto}"
        </Typography>
      </Box>
    </Paper>
  );
});

export default CertificadoComponent;