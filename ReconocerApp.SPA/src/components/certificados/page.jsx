import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, Modal, Container } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid
import CertificadoComponent from "./certificadoComponent";
import { getCertificados } from "../../utils/services/certificado";
import { useMsal } from "@azure/msal-react";
import { getColaboradoresFromBatchIds } from "../../utils/services/colaboradores";

export default function Certificados() {
  const { instance, accounts } = useMsal();
  const user = accounts[0];
  const oid = user?.idTokenClaims?.oid;

  const [certificates, setCertificados] = useState([]);
  const [selectedCertificado, setSelectedCertificado] = useState(null); // State for modal
  const [open, setOpen] = useState(false); // Modal open state
  const [colaboradores, setColaboradores] = useState([]); // State for collaborators
  const certificadoRef = useRef(null); // Correct declaration of the ref

  const handleRowClick = (params) => {
    setSelectedCertificado(params.row); // Set the selected certificate
    setOpen(true); // Open the modal
  };

  const handleClose = () => setOpen(false); // Close the modal

  useEffect(() => {
    const fetchCertificados = async () => {
      if (!oid) return;
      try {
        const allCertificates = await getCertificados({
          filters: [
            {
              field: "ReconocidoId",
              operator: "eq",
              value: oid,
            },
            {
              field: "Estado",
              operator: "eq",
              value: "aprobado",
            },
          ]
        });
        setCertificados(allCertificates);
      } catch (error) {
        console.error("Error al obtener los certificados:", error);
      }
    };

    fetchCertificados();
  }, [oid]);

  // Obtener los perfiles de los colaboradores desde graph batch
  const fetchColaboradores = async () => {
    let ids = [];
    if (certificates.length > 0) {
      const reconocedores = certificates.map((cert) => cert.reconocedorId);
      const reconocidos = certificates.map((cert) => cert.reconocidoId);
      ids = [...new Set([...reconocedores, ...reconocidos])];
    }
    const uniqueIds = [...new Set(ids)];

    try {
      const users = await getColaboradoresFromBatchIds(uniqueIds, instance, accounts);
      setColaboradores(users);
    }
    catch (error) {
      console.error("Error al obtener los colaboradores:", error);
    }
  }

  useEffect(() => {
    if (certificates.length > 0) {
      fetchColaboradores();
    }
  }
  , [certificates, instance, accounts]);
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "reconocedorId",
      headerName: "Reconocedor",
      width: 250,
      renderCell: (params) => {
        return colaboradores.find((col) => col.id === params.value)?.displayName || "Cargando...";
      },
    },
    { field: "texto", headerName: "Texto", width: 300 },
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
          rows={certificates}
          columns={columns}
          getRowId={(row) => row.reconocimientoId}
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
          {selectedCertificado && (
            <CertificadoComponent
              Certificado={selectedCertificado}
              Reconocedor={colaboradores.find((col) => col.id === selectedCertificado.reconocedorId)}
              Colaborador={colaboradores.find((col) => col.id === selectedCertificado.reconocidoId)}
              ref={certificadoRef} // Just pass the ref directly
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
