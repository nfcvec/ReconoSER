import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CertificadoComponent from "./certificadoComponent";
import { getCertificados } from "../../utils/services/certificado";
import { getColaboradoresFromBatchIds } from "../../utils/services/colaboradores";
import html2canvas from 'html2canvas';
import { useMsal } from "@azure/msal-react";
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';

export default function Certificados() {
  const {instance} = useMsal();
  const user = instance.getActiveAccount();
  const oid = user?.idTokenClaims?.oid;

  const [certificates, setCertificados] = useState([]);
  const [selectedCertificado, setSelectedCertificado] = useState(null);
  const [open, setOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  const certificadoRef = useRef(null);

  const handleRowClick = ({ row }) => {
    setSelectedCertificado(row);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Utilidades
  const isWebShareSupported = typeof navigator !== 'undefined' && !!navigator.canShare && !!navigator.share;

  // Descargar y compartir
  const handleDownload = async () => {
    if (!certificadoRef.current) return;
    try {
      const canvas = await html2canvas(certificadoRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#fff' });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `certificado-${selectedCertificado.reconocimientoId}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }, 'image/png');
    } catch (error) { console.error('Error al exportar el certificado:', error); }
  };

  const handleShare = async () => {
    if (!certificadoRef.current || !isWebShareSupported) return;
    try {
      const canvas = await html2canvas(certificadoRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#fff' });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `certificado-${selectedCertificado.reconocimientoId}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'Certificado de Reconocimiento', text: '¡Mira mi certificado de reconocimiento!' });
          } catch {}
        }
      }, 'image/png');
    } catch (error) { console.error('Error al compartir el certificado:', error); }
  };

  // Fetch certificados y colaboradores
  useEffect(() => {
    if (!oid) return;
    getCertificados({
      filters: [
        { field: 'ReconocidoId', operator: 'eq', value: oid },
        { field: 'Estado', operator: 'eq', value: 'aprobado' },
      ]
    })
      .then(setCertificados)
      .catch(e => console.error('Error al obtener los certificados:', e));
  }, [oid]);

  useEffect(() => {
    if (!certificates.length) return;
    const ids = [...new Set(certificates.flatMap(cert => [cert.reconocedorId, cert.reconocidoId]))];
    getColaboradoresFromBatchIds(ids)
      .then(setColaboradores)
      .catch(e => console.error('Error al obtener los colaboradores:', e));
  }, [certificates]);

  const columns = [
    { field: 'reconocimientoId', headerName: 'ID' },
    {
      field: 'reconocedorId',
      headerName: 'Reconocedor',
      renderCell: ({ value }) => colaboradores.find(col => col.id === value)?.displayName || 'Cargando...'
    },
    { field: 'texto', headerName: 'Mensaje del Solicitante' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1">
        Mis Certificados
      </Typography>
      <Typography variant="body1">
        Aquí puedes consultar tus certificados de reconocimiento. Haz clic en un certificado para verlo en detalle.
      </Typography>

      <Box>
        <DataGrid
          rows={certificates}
          columns={columns}
          getRowId={(row) => row.reconocimientoId}
          pageSize={5}
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
          }}
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
      >
        {selectedCertificado && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
              <strong>Certificado de Reconocimiento</strong>
              <IconButton aria-label="close" onClick={handleClose} size="large">
                <CloseIcon />
              </IconButton>
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
                display: 'flex',
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
              <IconButton color="primary" onClick={handleDownload} aria-label="descargar">
                <DownloadIcon />
              </IconButton>
              {isWebShareSupported && (
                <IconButton color="success" onClick={handleShare} aria-label="compartir">
                  <ShareIcon />
                </IconButton>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
