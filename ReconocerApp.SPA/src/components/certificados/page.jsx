import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardActions, CardContent, Grid, Container, Box, Typography } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import CertificadoComponent from "./certificadoComponent";
import { getCertificados } from "../../utils/services/certificado";
import { useMsal } from "@azure/msal-react";
import { toPng } from "html-to-image";

export default function Certificados() {
  const { accounts } = useMsal();
  const user = accounts[0];
  const oid = user?.idTokenClaims?.oid; // OID del colaborador autenticado

  const [certificates, setCertificates] = useState([]);
  const certificateRefs = useRef({});

  const handleDownload = async (id) => {
    const ref = certificateRefs.current[id];
    if (!ref) return;

    try {
      const dataUrl = await toPng(ref, { cacheBust: true });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `certificado-${id}.png`;
      link.click();
    } catch (error) {
      console.error("Error al descargar el certificado:", error);
    }
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!oid) return; // Si aún no hay OID, no hace la llamada
      try {
        const allCertificates = await getCertificados(); // Llama API
        console.log("Todos los certificados:", allCertificates);

        // Filtra certificados del colaborador actual
        const filteredCertificates = allCertificates.filter(
          (cert) => cert.tokenColaborador === oid
        );

        console.log("Certificados filtrados:", filteredCertificates);
        setCertificates(filteredCertificates); // Actualiza estado
      } catch (error) {
        console.error("Error al obtener los certificados:", error);
      }
    };

    fetchCertificates();
  }, [oid]); // Dependemos del oid

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        gap: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
        Mis Certificados
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Aquí puedes ver y descargar los certificados de comportamientos que has realizado.
      </Typography>

      <Grid container spacing={3}>
        {certificates.map((certificate, index) => (
          <Grid item xs={12} sm={6} md={4} key={certificate.reconocimientoId || index}>
            <Card>
              <CardContent ref={(el) => (certificateRefs.current[certificate.reconocimientoId || index] = el)}>
                <CertificadoComponent
                  nombreColaborador={certificate.nombreColaborador}
                  comportamientosSeleccionados={certificate.comportamientosSeleccionados}
                  fechaActual={certificate.fechaCreacion}
                  titulo={certificate.titulo}
                  texto={certificate.texto}
                  justificacion={certificate.justificacion}
                  oid={oid} // Pasamos el OID como prop
                />
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(certificate.reconocimientoId || index)}
                >
                  Descargar Certificado
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {certificates.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No tienes certificados disponibles.</Typography>
        </Box>
      )}

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button variant="outlined">Volver al Inicio</Button>
        </Link>
      </Box>
    </Box>
  );
}
