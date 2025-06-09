import React, { forwardRef, useState, useEffect } from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import { useOrganizacion } from "../../contexts/OrganizacionContext";
import fondo from '../../assets/RECONOCER.jpg';

const CertificadoComponent = forwardRef(({
  Certificado,
  Reconocedor,
  Reconocido,
}, ref) => {

  const { organizacion } = useOrganizacion();
  const texto = Certificado?.texto || "Texto no disponible";

  // Medidas A4 en px para pantalla (aprox. 1pt = 1.333px)
  const A4_WIDTH_PX = 595.28 * 1.333; // ≈ 793px
  const A4_HEIGHT_PX = 841.89 * 1.333; // ≈ 1122px
  const [imageSize, setImageSize] = useState({ width: A4_WIDTH_PX, height: A4_HEIGHT_PX });

  useEffect(() => {
    setImageSize({ width: A4_WIDTH_PX, height: A4_HEIGHT_PX });
  }, []);

  const textShadowStyle = {
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
    color: "#fff"
  };

  return (
    <Paper
      ref={ref}
      elevation={3}
      sx={{
        p: 0,
        width: `${imageSize.width}px`,
        height: `${imageSize.height}px`,
        backgroundImage: `url(${fondo})`,
        backgroundSize: '100% 100%', // ocupa exacto
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(221, 13, 65, 0.7)',
          borderRadius: 2,
          padding: { xs: 2, sm: 3 },
          boxShadow: 1,
          width: { xs: '98%', sm: '95%', md: '90%' }, // Aumentar el ancho del cuadro rojo
          mx: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          align="left"
          sx={{ ...textShadowStyle, mb: 2 }}
        >
          ¡Felicitaciones!
        </Typography>

        <Typography
          variant="body1"
          align="left"
          gutterBottom
          sx={{ ...textShadowStyle, mb: 2 }}
        >
          Talentos como tú nos enorgullecen y destacamos en ti:
        </Typography>
        {/* Comportamientos debajo del mensaje */}
        <Grid container spacing={3} justifyContent="center" mt={2}>
          {Certificado?.comportamientos?.map(({ iconSvg, nombre }, idx) => (
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
        {/* Padding de separación debajo de los comportamientos */}
        <Box sx={{ height: 16 }} />
        <Typography
          variant="body1"
          sx={{
            ...textShadowStyle,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 1,
            width: 'calc(100% + 2 * 24px)',
            marginLeft: '-24px',
            marginRight: '-24px',
            px: 2,
            py: 1,
            display: 'flex', // Usar flex para alinear los textos
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <span style={{ textAlign: 'left', flex: 1 }}>
            De: <strong>{Reconocedor?.displayName || 'Reconocedor no encontrado'}</strong>
          </span>
          <span style={{ textAlign: 'center', flex: 1 }}>
            Para: <strong>{Reconocido?.displayName || 'Colaborador no encontrado'}</strong>
          </span>
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontStyle: 'italic',
            fontWeight: 'medium',
            ...textShadowStyle,
            fontSize: { xs: '1rem', sm: '1.15rem' },
          }}
        >
          "{texto}"
        </Typography>
      </Box>
    </Paper>
  );
});

export default CertificadoComponent;
