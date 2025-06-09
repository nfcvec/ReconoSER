import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button, Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CertificadoComponent from "./certificadoComponent";
import { getCertificados } from "../../utils/services/certificado";
import { getColaboradoresFromBatchIds } from "../../utils/services/colaboradores";
import html2canvas from 'html2canvas';
import { useMsal } from "@azure/msal-react";
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import PdfDownloadButton from "./PdfDownloadButton";

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
    // Navegar a la pantalla de detalle del certificado
    window.location.href = `/certificados/${row.reconocimientoId}`;
  };

  // Utilidades
  const isWebShareSupported = typeof navigator !== 'undefined' && !!navigator.canShare && !!navigator.share;

  // Compartir
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

      {/* El diálogo ya no se usa para mostrar el certificado */}
    </Box>
  );
}
