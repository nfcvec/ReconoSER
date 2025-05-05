import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { getReconocimientos } from "../../../utils/services/reconocimientos";
import { getColaboradores } from "../../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";
import { useAlert } from "../../../contexts/AlertContext";

const SelectorReconocimientos = ({ onSelect, multiple = false }) => {
  const [reconocimientos, setReconocimientos] = useState([]);
  const [colaboradores, setColaboradores] = useState({});
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const { instance, accounts } = useMsal();
  const showAlert = useAlert();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReconocimientos();
      setReconocimientos(data);
    } catch (error) {
      console.error("Error al cargar reconocimientos:", error);
      showAlert("Error al cargar los reconocimientos", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  const fetchColaboradores = useCallback(async () => {
    try {
      const response = await instance.acquireTokenSilent({
        account: accounts[0],
        scopes: ["User.Read.All"],
      });

      const users = await getColaboradores(response.accessToken);
      const map = {};
      users.forEach((user) => {
        map[user.id] = user.displayName;
      });
      setColaboradores(map);
    } catch (error) {
      console.error("Error al obtener colaboradores:", error);
    }
  }, [instance, accounts]);

  useEffect(() => {
    fetchData();
    fetchColaboradores();
  }, [fetchData, fetchColaboradores]);

  const handleSelectionChange = (selection) => {
    const selectedItems = reconocimientos.filter((r) =>
      selection.includes(r.reconocimientoId)
    );
    setSelected(selectedItems);
  };

  const columns = [
    {
      field: "tokenColaborador",
      headerName: "Colaborador",
      width: 250,
      renderCell: (params) => colaboradores[params.value] || params.value,
    },
    { field: "justificacion", headerName: "Justificación", width: 250 },
    { field: "texto", headerName: "Texto", width: 250 },
    { field: "titulo", headerName: "Título", width: 250 },
    { field: "fechaCreacion", headerName: "Fecha Creación", width: 200 },
    { field: "estado", headerName: "Estado", width: 150 },
    { field: "comentarioRevision", headerName: "Comentario Revisión", width: 250 },
    { field: "fechaResolucion", headerName: "Fecha Resolución", width: 200 },
  ];

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={reconocimientos}
        columns={columns}
        loading={loading}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.reconocimientoId}
        checkboxSelection={multiple}
        onSelectionModelChange={(selection) => handleSelectionChange(selection)}
      />
      {onSelect && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => onSelect(multiple ? selected : selected[0])}
            disabled={selected.length === 0}
          >
            Confirmar selección
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SelectorReconocimientos;
