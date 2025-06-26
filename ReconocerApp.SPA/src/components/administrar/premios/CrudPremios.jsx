import React, { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Box,
  Container,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import {
  getPremios,
} from "../../../utils/services/premios";
import { useAlert } from "../../../contexts/AlertContext";
import { useLoading } from "../../../contexts/LoadingContext";
import PremioForm from "./PremioForm";
import { useOrganizacion } from "../../../contexts/OrganizacionContext";

const CrudPremios = () => {
  const [premios, setPremios] = useState([]);
  const [selectedPremio, setSelectedPremio] = useState(null); // Premio seleccionado para editar
  const [openPremioDialog, setOpenPremioDialog] = useState(false); // Controla el diálogo de Premio
  const showAlert = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const {organizacion} = useOrganizacion();

  const fetchPremios = async () => {
    showLoading("Cargando premios...");
    try {
      const data = await getPremios({
        filters: [
          { field: "OrganizacionId", operator: 'eq', value: `${organizacion.organizacionId}` },
        ],
        orderBy: "Nombre",
        orderDirection: "asc",
        page: 1,
        pageSize: 1000,
      });
      setPremios(data);
    } catch (error) {
      showAlert("Error al cargar los premios.", "error");
      console.error("Error al cargar los premios:", error);
    } finally {
      hideLoading();
    }
  }

  useEffect(() => {
    fetchPremios();
  }, [organizacion]);

  const handleOpenPremioDialog = (premio = null) => {
    setSelectedPremio(premio); 
    setOpenPremioDialog(true);
  };

  const handleClosePremioDialog = (shouldReload = false) => {
    setOpenPremioDialog(false);
    setSelectedPremio(null); 
    if (shouldReload) {
      fetchPremios();
    }
  };

  const columns = [
    { field: "imagenPrincipal", headerName: "Imagen", width: 150, renderCell: (params) => <Avatar src={params.value ? `data:image/jpeg;base64,${params.value}` : "/no-image.jpg"} /> },
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "descripcion", headerName: "Descripción", width: 300 },
    { field: "costoWallet", headerName: "Precio", width: 150 },
    {
      field: "categoriaNombre",
      headerName: "Categoría",
      width: 200,
      renderCell: (params) => params.row?.categoria?.nombre || "No asignada",
    },
  ];

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, width: "100%", overflow: "auto" }}>
        <Typography variant="h4" color="white">Administrar Premios</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenPremioDialog()}
        >
          Agregar Premio
        </Button>
      </Box>
      <DataGrid
        rows={premios}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.premioId}
        onRowClick={(params) => handleOpenPremioDialog(params.row)}
      />

      {openPremioDialog && (
        <PremioForm
          open={openPremioDialog}
          onClose={handleClosePremioDialog}
          premio={selectedPremio}
        />
      )}
    </Container>
  );
};

export default CrudPremios;
