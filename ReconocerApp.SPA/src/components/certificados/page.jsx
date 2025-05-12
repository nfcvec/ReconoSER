import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CertificadoComponent from "./certificadoComponent";
import { getCertificados } from "../../utils/services/certificado";
import { useMsal } from "@azure/msal-react";
import { getColaboradoresFromBatchIds } from "../../utils/services/colaboradores";
import html2canvas from 'html2canvas';

export default function Certificados() {
  const { instance, accounts } = useMsal();
  const user = accounts[0];
  const oid = user?.idTokenClaims?.oid;

  const [certificates, setCertificados] = useState([]);
  const [selectedCertificado, setSelectedCertificado] = useState(null);
  const [open, setOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  const certificadoRef = useRef(null);

  const handleRowClick = (params) => {
    setSelectedCertificado(params.row);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleExportToImage = async () => {
    if (certificadoRef.current) {
      try {
        const canvas = await html2canvas(certificadoRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });
        
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.download = `certificado-${selectedCertificado.reconocimientoId}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          
          URL.revokeObjectURL(link.href);
        }, 'image/png');
      } catch (error) {
        console.error("Error al exportar el certificado:", error);
      }
    }
  };

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
  }, [certificates, instance, accounts]);

  const columns = [
    { 
      field: "id", 
      headerName: "ID", 
    },
    {
      field: "reconocedorId",
      headerName: "Reconocedor",
      renderCell: (params) => {
        return colaboradores.find((col) => col.id === params.value)?.displayName || "Cargando...";
      },
    },
    { 
      field: "texto", 
      headerName: "Texto"
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1">
        Mis Certificados
      </Typography>
      <Typography variant="body1">
        Aquí puedes ver y visualizar los certificados de comportamientos que has realizado.
      </Typography>

      <Box>
        <DataGrid
          rows={certificates}
          columns={columns}
          getRowId={(row) => row.reconocimientoId}
          pageSize={5}
          onRowClick={handleRowClick}
        />
      </Box>

      {certificates.length === 0 && (
        <Box>
          <Typography>No tienes certificados disponibles.</Typography>
        </Box>
      )}

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            width: '100%',
            m: 2
          }
        }}
      >
        {selectedCertificado && (
          <>
            <DialogTitle>
              Certificado de Reconocimiento
            </DialogTitle>
            <DialogContent sx={{ 
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
              }
            }}>
              <Box sx={{ 
                minWidth: '720px',
                minHeight: '720px',
              }}>
                <CertificadoComponent
                  Certificado={selectedCertificado}
                  Reconocedor={colaboradores.find((col) => col.id === selectedCertificado.reconocedorId)}
                  Reconocido={colaboradores.find((col) => col.id === selectedCertificado.reconocidoId)}
                  ref={certificadoRef}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleExportToImage}
              >
                Descargar
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleClose}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
