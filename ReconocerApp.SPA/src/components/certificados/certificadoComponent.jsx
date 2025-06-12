import React, { forwardRef, useState, useEffect } from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import { useOrganizacion } from "../../contexts/OrganizacionContext";
import fondo from '../../assets/RECONOCER.png';

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
    textShadow: "2px 2px 2px rgba(0, 0, 0, 0.7)",
    color: "#fff"
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: `1024px`,
        mx: 'auto',
      }}
    >
      {/* Fundido a negro arriba */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '200px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))',
          zIndex: 2,
          pointerEvents: 'none',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />
      {/* Fundido a negro abajo */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '200px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
          zIndex: 2,
          pointerEvents: 'none',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      />
      {/* Icono de la organización por encima del fundido */}
      {organizacion?.iconSvg && (
        <Box
          sx={{
            position: 'absolute',
            zIndex: 10, // Más alto que los fundidos
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '720px',
            mx: 'auto',
            color: '#fff',
            '& svg': {
              width: '100%',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.6))',
            },
          }}
          dangerouslySetInnerHTML={{
            __html: organizacion.iconSvg
          }}
        />
      )}
      <Paper
        ref={ref}
        elevation={3}
        sx={{
          p: 0,
          width: `1024px`,
          height: `1024px`,
          backgroundImage: `url(${fondo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'space-between',
          mx: 'auto',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'primary.main',
            borderRadius: 2,
            padding: { xs: 2, sm: 3 },
            boxShadow: 1,
            width: { xs: '98%', sm: '95%', md: '90%' },
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
                      backgroundColor: "primary.main",
                      borderRadius: 2,
                      boxShadow: 5,
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
              display: 'flex',
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
              textAlign: 'justify',
              display: 'block',
            }}
          >
            "{texto}"
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
});

export default CertificadoComponent;
