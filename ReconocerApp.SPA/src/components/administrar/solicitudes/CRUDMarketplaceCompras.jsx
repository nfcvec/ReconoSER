import React, { useState, useEffect } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  getPremiosCompras,
} from "../../../utils/services/premiosCompra";
import { useMsal } from "@azure/msal-react";
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";

const CRUDMarketplaceCompras = () => {
  const [compras, setCompras] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const { instance, accounts } = useMsal();

  const fetchCompras = async () => {
    try {
      const data = await getPremiosCompras({
        filters: [{
          field: "estado",
          operator: "eq",
          value: "pendiente",
        }],
        orderBy: "fechaCompra",
        orderDirection: "desc",
      });
      console.log("Datos de compras:", data);
      setCompras(data);
    } catch (error) {
      console.error("Error al cargar las compras:", error);
    }
  };

  const fetchColaboradores = async () => {
    const ids = compras.map((compra) => compra.tokenColaborador);
    const uniqueIds = [...new Set(ids)];
    const data = await getColaboradoresFromBatchIds(uniqueIds, instance, accounts);
    setColaboradores(data);
  }

  useEffect(() => {
    fetchCompras();
  }, []);

  useEffect(() => {
    if (compras.length > 0) {
      fetchColaboradores();
    }
  }, [compras]);

  const columns = [
    {
      field: "tokenColaborador",
      headerName: "Solicitante",
      width: 250,
      renderCell: (params) => colaboradores.find((col) => col.id === params.value)?.displayName || "Cargando...",
    },
    {
      field: "premio",
      headerName: "Premio",
      width: 250,
      valueGetter: (params) => {
        return params.row.nombre;
      }
    },
    { field: "fechaCompra", headerName: "Fecha de Compra", width: 200 },
    { field: "estado", headerName: "Estado", width: 150 }
  ];

  return (
    <Container>
      <Typography variant="h4">Revisar solicitudes de compra</Typography>
      <DataGrid
        rows={compras}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.compraId}
        onRowClick={(params) => {
          if (params.row) {
            setSelectedCompra(params.row);
            setOpen(true);
          }
        }}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Detalles de la compra</DialogTitle>
        <DialogContent>
          {selectedCompra && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Solicitante:</strong> {colaboradores.find(col => col.id === selectedCompra.tokenColaborador)?.displayName || "Desconocido"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Premio:</strong> {selectedCompra.nombre}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Fecha de Compra:</strong> {selectedCompra.fechaCompra}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Estado:</strong> {selectedCompra.estado}</Typography>
              </Grid>
              {/* Agrega más campos si es necesario */}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CRUDMarketplaceCompras;