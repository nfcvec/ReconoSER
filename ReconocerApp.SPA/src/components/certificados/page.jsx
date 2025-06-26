import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getCertificados } from "../../utils/services/certificado";
import { getColaboradoresFromBatchIds } from "../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";
import FondoLayout from '../../contexts/FondoLayout';

const Certificados = () => {
  const { instance } = useMsal();
  const user = instance.getActiveAccount();
  const oid = user?.idTokenClaims?.oid;

  const [certificates, setCertificados] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);

  const handleRowClick = ({ row }) => {
    window.location.href = `/certificados/${row.reconocimientoId}`;
  };

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
    <>
      <FondoLayout />
      <Box>
        <Typography variant="h4" component="h1" color="white">
          Mis Certificados
        </Typography>
        <Typography variant="body1" color="white">
          Aquí puedes consultar tus certificados de reconocimiento. Haz clic en un certificado para verlo en detalle.
        </Typography><br />
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
      </Box>
    </>
  );
};

export default Certificados;