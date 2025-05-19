import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { getWalletBalance } from "../../../utils/services/walletBalance";
import { getColaboradores, getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";
import { useAlert } from "../../../contexts/AlertContext";
import { getOrganizaciones } from "../../../utils/services/organizaciones";

const SelectorWalletSaldos = ({ onSelect, multiple = false }) => {
  const [walletSaldos, setWalletSaldos] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [colaboradores, setColaboradores] = useState({});
  const [organizacionId, setOrganizacionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { accounts } = useMsal(); // Solo accounts si es necesario para el dominio
  const showAlert = useAlert();

  const fetchOrganizacionId = useCallback(async () => {
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
      }
    } catch (error) {
      console.error("Error al obtener organizaciones:", error);
    }
  }, [accounts]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWalletBalance();
      const filtradas = data.filter(
        (item) => item.organizacionId === organizacionId
      );
      setWalletSaldos(filtradas);
    } catch (error) {
      console.error("Error al cargar saldos:", error);
      showAlert("Error al cargar los saldos de billetera", "error");
    } finally {
      setLoading(false);
    }
  }, [organizacionId, showAlert]);

  const fetchColaboradores = useCallback(async () => {
    const ids = walletSaldos.map((item) => item.tokenColaborador);
    const uniqueIds = [...new Set(ids)];
    const users = await getColaboradoresFromBatchIds(uniqueIds);
    setColaboradores(users);
  }, [walletSaldos]);

  useEffect(() => {
    fetchOrganizacionId();
    fetchColaboradores();
  }, [fetchOrganizacionId, fetchColaboradores]);

  useEffect(() => {
    if (organizacionId) {
      fetchData();
    }
  }, [organizacionId, fetchData]);

  const handleSelectionChange = (selection) => {
    const selected = walletSaldos.filter((item) =>
      selection.includes(item.walletSaldoId)
    );
    setSelectedItems(selected);
  };

  const columns = [
    { field: "walletSaldoId", headerName: "ID", width: 100 },
    {
      field: "tokenColaborador",
      headerName: "Colaborador",
      width: 250,
      renderCell: (params) => colaboradores.find((col) => col.id === params.value)?.displayName || "Cargando...",
    },
    { field: "saldoActual", headerName: "Saldo Actual", width: 150 },
  ];

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={walletSaldos}
        columns={columns}
        loading={loading}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.walletSaldoId}
        checkboxSelection={multiple}
        onSelectionModelChange={handleSelectionChange}
      />
      {onSelect && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => onSelect(multiple ? selectedItems : selectedItems[0])}
            disabled={selectedItems.length === 0}
          >
            Confirmar Selección
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SelectorWalletSaldos;
