import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { getPremiosCompras } from "../../../utils/services/marketplaceCompras";
import { useAlert } from "../../../contexts/AlertContext";

const SelectorMarketplaceCompras = ({ onSelect, multiple = false }) => {
  const [compras, setCompras] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPremiosCompras();
      setCompras(data);
    } catch (error) {
      showAlert("Error al cargar las compras", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectionChange = (selection) => {
    const selectedItems = compras.filter((item) =>
      selection.includes(item.compraId)
    );
    setSelected(selectedItems);
  };

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={compras}
        columns={[{ field: "compraId", headerName: "ID", width: 100 }]}
        pageSize={5}
        checkboxSelection={multiple}
        onSelectionModelChange={handleSelectionChange}
        loading={loading}
      />
      {onSelect && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => onSelect(multiple ? selected : selected[0])}
          >
            Confirmar Selección
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SelectorMarketplaceCompras;
