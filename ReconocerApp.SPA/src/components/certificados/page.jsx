import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getCertificados } from "../../utils/services/certificado";
import { getColaboradoresFromBatchIds } from "../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";
import FondoLayout from '../../contexts/FondoLayout';
import { useLoading } from "../../contexts/LoadingContext";
import { useAlert } from "../../contexts/AlertContext";

const Certificados = () => {
  const { instance } = useMsal();
  const user = instance.getActiveAccount();
  const oid = user?.idTokenClaims?.oid;
  const { showLoading, hideLoading } = useLoading();
  const showAlert = useAlert();

  const [certificates, setCertificados] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);

  const handleRowClick = ({ row }) => {
    window.location.href = `/certificados/${row.reconocimientoId}`;
  };

  useEffect(() => {
    if (!oid) return;
    
    const fetchCertificados = async () => {
      showLoading("Cargando certificados...");
      try {
        const data = await getCertificados({
          filters: [
            { field: 'ReconocidoId', operator: 'eq', value: oid },
            { field: 'Estado', operator: 'eq', value: 'aprobado' },
          ]
        });
        setCertificados(data);
      } catch (error) {
        console.error('Error al obtener los certificados:', error);
        showAlert("Error al cargar los certificados", "error");
      } finally {
        hideLoading();
      }
    };

    fetchCertificados();
  }, [oid, showLoading, hideLoading, showAlert]);

  useEffect(() => {
    if (!certificates.length) return;
    
    const fetchColaboradores = async () => {
      showLoading("Cargando información de colaboradores...");
      try {
        const ids = [...new Set(certificates.flatMap(cert => [cert.reconocedorId, cert.reconocidoId]))];
        const data = await getColaboradoresFromBatchIds(ids);
        setColaboradores(data);
      } catch (error) {
        console.error('Error al obtener los colaboradores:', error);
        showAlert("Error al cargar la información de colaboradores", "error");
      } finally {
        hideLoading();
      }
    };

    fetchColaboradores();
  }, [certificates, showLoading, hideLoading, showAlert]);

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