import React, { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Button,
  Box,
  Container,
  Typography,
} from "@mui/material";
import {
  getPremios,
} from "../../../utils/services/premios";
import { getOrganizaciones } from "../../../utils/services/organizaciones";
import { useMsal } from "@azure/msal-react";
import { useAlert } from "../../../contexts/AlertContext";
import PremioComponent from "./PremioComponent"; // Importar PremioComponent

const CRUDPremios = () => {
  const [premios, setPremios] = useState([]);
  const [selectedPremio, setSelectedPremio] = useState(null); // Premio seleccionado para editar
  const [loading, setLoading] = useState(false);
  const [organizacionId, setOrganizacionId] = useState(null);
  const [openPremioDialog, setOpenPremioDialog] = useState(false); // Controla el diálogo de Premio

  const { accounts } = useMsal();
  const showAlert = useAlert();

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
          console.error("Organización no encontrada para el dominio:", domain);
          showAlert("Organización no encontrada para el dominio: " + domain, "error");
        }
      } catch (error) {
        console.error("Error al obtener organizaciones:", error);
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
      console.error("Error al cargar los premios:", error);
      showAlert("Error al cargar los premios.", "error");
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
    setSelectedPremio(premio); // Establecer el premio seleccionado (o null para crear uno nuevo)
    setOpenPremioDialog(true);
  };

  const handleClosePremioDialog = (shouldReload = false) => {
    setOpenPremioDialog(false);
    setSelectedPremio(null); // Limpiar el premio seleccionado
    if (shouldReload) {
      fetchPremios(); // Recargar la lista de premios si se creó o editó uno
    }
  };

  const columns = [
    { field: "premioId", headerName: "ID", width: 100 },
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "descripcion", headerName: "Descripción", width: 300 },
    { field: "costoWallet", headerName: "Costo Wallet", width: 150 },
    { field: "imagenUrl", headerName: "Imagen URL", width: 200 },
    { field: "cantidadActual", headerName: "Cantidad Actual", width: 150 },
    { field: "ultimaActualizacion", headerName: "Última Actualización", width: 200 },
    {
      field: "categoriaNombre",
      headerName: "Categoría",
      width: 200,
      renderCell: (params) => {
        return params.row?.categoria?.nombre || "No asignada";
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenPremioDialog(params.row)}
        >
          Editar
        </Button>
      ),
    },
  ];

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, width: "100%", overflow: "auto" }}>
        <h1>Gestión de Premios</h1>
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
        loading={loading}
        sx={{
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
        }}
      />

      {/* Diálogo para crear o editar un premio */}
      {openPremioDialog && (
        <PremioComponent
          open={openPremioDialog}
          onClose={handleClosePremioDialog}
          premioData={selectedPremio}
          organizacionId={organizacionId}
        />
      )}
    </Container>
  );
};

export default CRUDPremios;