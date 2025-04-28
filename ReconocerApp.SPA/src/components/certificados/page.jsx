import { Link } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { Button, Card, CardContent, CardActions, Typography, Grid, Container, Box } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { getCertificados } from "../../utils/services/certificado";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Certificados() {
  const [certificates, setCertificates] = useState([]);
  const certificateRefs = useRef({}); // Guardar múltiples refs (uno por certificado)

  useEffect(() => {
    const fetchCertificados = async () => {
      try {
        const data = await getCertificados();
        console.log("Certificados obtenidos:", data);
        setCertificates(data);
      } catch (error) {
        console.error("Error al obtener los certificados:", error);
      }
    };

    fetchCertificados();
  }, []);

  const handleDownload = async (id) => {
    const element = certificateRefs.current[id];
    if (!element) return;

    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`certificado-${id}.pdf`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 7 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
        Mis Certificados
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Aquí puedes ver y descargar los certificados de comportamientos que has realizado.
      </Typography>

      <Grid container spacing={3}>
        {certificates.map((certificate) => (
          <Grid item xs={12} sm={6} md={4} key={certificate.id}>
            <Card>
              {/* Aquí capturamos el contenido que queremos convertir a PDF */}
              <CardContent ref={(el) => (certificateRefs.current[certificate.id] = el)}>
                <Typography variant="h6" component="h2">
                  {certificate.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {certificate.date}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(certificate.id)}
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
    </Container>
  );
}