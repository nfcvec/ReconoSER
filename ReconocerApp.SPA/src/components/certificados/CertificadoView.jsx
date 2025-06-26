import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PdfDownloadButton from "./PdfDownloadButton";
import ShareIcon from '@mui/icons-material/Share';
import CertificadoComponent from "./certificadoComponent";
import { getCertificadoById, getCertificados } from "../../utils/services/certificado";
import { getColaboradoresFromBatchIds } from "../../utils/services/colaboradores";
import html2canvas from 'html2canvas';

export default function CertificadoView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificado, setCertificado] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const certificadoRef = useRef(null);
  const isWebShareSupported = typeof navigator !== 'undefined' && !!navigator.canShare && !!navigator.share;

  useEffect(() => {
    if (!id) return;
    getCertificadoById(id)
      .then(res => setCertificado(res))
      .catch(e => console.error('Error al obtener el certificado:', e));
  }, [id]);

  useEffect(() => {
    if (!certificado) return;
    const ids = [certificado.reconocedorId, certificado.reconocidoId];
    getColaboradoresFromBatchIds(ids)
      .then(setColaboradores)
      .catch(e => console.error('Error al obtener los colaboradores:', e));
  }, [certificado]);

  const handleShare = async () => {
    if (!certificadoRef.current || !isWebShareSupported) return;
    try {
      const canvas = await html2canvas(certificadoRef.current, { scale: 2, useCORS: true, logging: false, backgroundColor: '#fff' });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `certificado-${certificado.reconocimientoId}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'Certificado de Reconocimiento', text: '¡Mira mi certificado de reconocimiento!' });
          } catch {}
        }
      }, 'image/png');
    } catch (error) { console.error('Error al compartir el certificado:', error); }
  };

  const reconocedor = colaboradores.find(col => col.id === certificado?.reconocedorId);
  const reconocido = colaboradores.find(col => col.id === certificado?.reconocidoId);

  return (
    <Box sx={{ minHeight: '100vh', p: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} aria-label="volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ ml: 1, color: '#fff' }}>
            Certificado de Reconocimiento
          </Typography>
        </Box>
        {certificado && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <PdfDownloadButton
              targetRef={certificadoRef}
              fileName={`certificado-${certificado.reconocimientoId}`}
              ariaLabel="descargar-pdf"
            />
            {isWebShareSupported && (
              <IconButton onClick={handleShare} aria-label="compartir">
                <ShareIcon />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
      {certificado ? (
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <Box 
            sx={{ 
              width: { xs: 'calc(100vw - 32px)', sm: '720px' },
              height: { xs: 'calc(100vh - 140px)', sm: '720px' },
              overflow: 'auto'
            }}
          >
            <Box sx={{ width: '720px', height: '720px' }}>
              <CertificadoComponent
                Certificado={certificado}
                Reconocedor={reconocedor}
                Reconocido={reconocido}
                ref={certificadoRef}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography color="#fff">Cargando certificado...</Typography>
      )}
    </Box>
  );
}
