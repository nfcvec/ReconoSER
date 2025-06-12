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

  // Componente auxiliar para renderizar SVG string como React Element
  function SvgFromString({ svgString, ...props }) {
    if (!svgString) return null;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svg = doc.documentElement;
      // Forzamos tamaño y color si es necesario
      svg.setAttribute('width', props.width || '100%');
      svg.setAttribute('height', props.height || 'auto');
      if (props.color) svg.setAttribute('color', props.color);
      // Convertimos el SVG DOM a JSX
      return (
        <span
          style={{ display: 'inline-block', width: props.width, height: props.height }}
          dangerouslySetInnerHTML={{ __html: svg.outerHTML }}
        />
      );
    } catch {
      return null;
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '1024px',
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'none',
      }}
    >
      <Paper
        ref={ref}
        elevation={3}
        sx={{
          p: 0,
          width: '1024px',
          minHeight: '1024px', // Mínimo 1024px, crece si el contenido lo requiere
          backgroundImage: `url(${fondo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          mx: 'auto',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Logo de la organización en la cabecera, centrado, sobre el fondo */}
        {organizacion?.iconSvg && (
          <Box
            sx={{
              width: '720px',
              maxWidth: '90%',
              mt: 6,
              mb: 2,
              mx: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#fff',
              '& svg': {
                width: '100%',
                height: '120px',
                display: 'block',
                filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.6))',
              },
            }}
          >
            <SvgFromString svgString={organizacion.iconSvg} width="100%" height="120px" color="#fff" />
          </Box>
        )}
        <Box
          sx={{
            backgroundColor: 'primary.main',
            borderRadius: 2,
            padding: { xs: 2, sm: 3 },
            boxShadow: 1,
            width: { xs: '98%', sm: '95%', md: '90%' },
            mx: 'auto',
            textAlign: 'center',
            mt: 2,
            mb: 4,
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
                    }}
                  >
                    <SvgFromString svgString={iconSvg} width="80px" height="80px" color="#fff" />
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
