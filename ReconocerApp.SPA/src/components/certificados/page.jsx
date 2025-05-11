import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, Modal, Container } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid
import CertificadoComponent from "./certificadoComponent";
import { getCertificados } from "../../utils/services/certificado";
import { useMsal } from "@azure/msal-react";

export default function Certificados() {
  const { accounts } = useMsal();
  const user = accounts[0];
  const oid = user?.idTokenClaims?.oid;

  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null); // State for modal
  const [open, setOpen] = useState(false); // Modal open state

  const handleRowClick = (params) => {
    setSelectedCertificate(params.row); // Set the selected certificate
    setOpen(true); // Open the modal
  };

  const handleClose = () => setOpen(false); // Close the modal

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!oid) return;
      try {
        const allCertificates = await getCertificados();
        const filteredCertificates = allCertificates.filter(
          (cert) => cert.tokenColaborador === oid
        );
        setCertificates(filteredCertificates);
      } catch (error) {
        console.error("Error al obtener los certificados:", error);
      }
    };

    fetchCertificates();
  }, [oid]);

  const columns = [
    { field: "titulo", headerName: "Título", flex: 1 },
    { field: "fechaCreacion", headerName: "Fecha", flex: 1 },
    { field: "texto", headerName: "Descripción", flex: 2 },
  ];

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
        Aquí puedes ver y visualizar los certificados de comportamientos que has realizado.
      </Typography>

      <Container maxWidth="md">
        <DataGrid
          rows={certificates.map((cert, index) => ({
            id: cert.reconocimientoId || index,
            ...cert,
          }))}
          columns={columns}
          autoHeight
          pageSize={5}
          onRowClick={handleRowClick} // Handle row click
        />
      </Container>

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

      {/* Modal for displaying the certificate */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          {selectedCertificate && (
            <CertificadoComponent
              nombreColaborador={selectedCertificate.nombreColaborador}
              comportamientosSeleccionados={selectedCertificate.comportamientosSeleccionados}
              fechaActual={selectedCertificate.fechaCreacion}
              titulo={selectedCertificate.titulo}
              texto={selectedCertificate.texto}
              justificacion={selectedCertificate.justificacion}
              oid={oid}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
