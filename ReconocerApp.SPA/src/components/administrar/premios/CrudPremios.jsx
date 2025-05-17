import React, { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Box,
  Container,
  Typography,
  Button,
} from "@mui/material";
import {
  getPremios,
} from "../../../utils/services/premios";
import { getOrganizaciones } from "../../../utils/services/organizaciones";
import { useMsal } from "@azure/msal-react";
import { useAlert } from "../../../contexts/AlertContext";
import PremioForm from "./PremioForm";

const CrudPremios = () => {
  const [premios, setPremios] = useState([]);
  const [selectedPremio, setSelectedPremio] = useState(null); // Premio seleccionado para editar
  const [loading, setLoading] = useState(false);
  const [organizacionId, setOrganizacionId] = useState(null);
  const [openPremioDialog, setOpenPremioDialog] = useState(false); // Controla el diálogo de Premio
  const showAlert = useAlert();


  const { accounts } = useMsal();

  useEffect(() => {
    const fetchOrganizacionId = async () => {
      const email = accounts[0]?.username || "";
      const domain = email.split("@")[1];
      try {
        const organizaciones = await getOrganizaciones();
        const org = organizaciones.find(
          (o) => o?.dominioEmail?.toLowerCase() === domain.toLowerCase()
        );
        if (org) {
          setOrganizacionId(org.organizacionId);
        } else {
          showAlert("Organización no encontrada para el dominio: " + domain, "error");
        }
      } catch (error) {
        showAlert("Error al obtener organizaciones", "error");
      }
    };

    fetchOrganizacionId();
  }, [accounts, showAlert]);

  const fetchPremios = useCallback(async () => {
    if (!organizacionId) return;
    setLoading(true);
    try {
      const data = await getPremios();
      const filtered = data.filter((p) => p.organizacionId === organizacionId);
      setPremios(filtered);
    } catch (error) {
      showAlert("Error al cargar los premios.", "error");
      console.error("Error al cargar los premios:", error);
    } finally {
      setLoading(false);
    }
  }, [organizacionId, showAlert]);

  useEffect(() => {
    if (organizacionId) {
      fetchPremios();
    }
  }, [organizacionId, fetchPremios]);

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
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "descripcion", headerName: "Descripción", width: 300 },
    { field: "costoWallet", headerName: "Precio", width: 150 },
    { field: "cantidadActual", headerName: "Stock", width: 150 },
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
        <Typography variant="h4">Gestión de Premios</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenPremioDialog()}
        >
          Agregar Premio
        </Button>
      </Box>
      <Typography variant="h6" padding={2}>Haz click en los premios para revisar su información</Typography>
      <DataGrid
        rows={premios}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.premioId}
        loading={loading}
        onRowClick={(params) => handleOpenPremioDialog(params.row)}
      />

      {openPremioDialog && (
        <PremioForm
          open={openPremioDialog}
          onClose={handleClosePremioDialog}
          premio={selectedPremio}
          organizacionId={organizacionId}
        />
      )}
    </Container>
  );
};

export default CrudPremios;
