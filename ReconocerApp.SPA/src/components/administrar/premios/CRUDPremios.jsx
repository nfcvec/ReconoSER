import React, { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Button,
  Box,
  Container,
} from "@mui/material";
import {
  getPremios,
} from "../../../utils/services/premios";
import { getOrganizaciones } from "../../../utils/services/organizaciones";
import { getCategorias } from "../../../utils/services/categorias";
import { useMsal } from "@azure/msal-react";
import { useAlert } from "../../../contexts/AlertContext";
import CRUDImagenes from "./CRUDImagenes";

const CRUDPremios = ({ onSelect, multiple = false, selectionMode = false }) => {
  const [premios, setPremios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedPremios, setSelectedPremios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [organizacionId, setOrganizacionId] = useState(null);

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

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
        showAlert("Error al cargar las categorías.", "error");
      }
    };

    fetchCategorias();
  }, [showAlert]);

  const handleSelectionChange = (selection) => {
    const selected = premios.filter((premio) => selection.includes(premio.premioId));
    setSelectedPremios(selected);
  };

  const handleConfirmSelection = () => {
    onSelect(multiple ? selectedPremios : selectedPremios[0]);
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
  ];

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, width: "100%", overflow: "auto" }}>
        <h1>{selectionMode ? "Seleccionar Premios" : "Ver Premios"}</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => console.log("Botón de Imágenes presionado")}
        >
          Imágenes
        </Button>
      </Box>
      <DataGrid
        rows={premios}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.premioId}
        loading={loading}
        checkboxSelection={selectionMode}
        onSelectionModelChange={selectionMode ? handleSelectionChange : undefined}
        sx={{
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
        }}
      />
      {selectionMode && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleConfirmSelection}
            disabled={selectedPremios.length === 0}
          >
            Confirmar Selección
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CRUDPremios;
