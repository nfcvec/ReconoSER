import React, { useState, useEffect, useCallback } from "react";
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
  Box,
  TextField,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  getPremiosCompras,
  revisarPremioCompra,
} from "../../../utils/services/premiosCompra";
import { useMsal } from "@azure/msal-react";
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { useLoading } from "../../../contexts/LoadingContext";

const CRUDMarketplaceCompras = () => {
  const [compras, setCompras] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [open, setOpen] = useState(false);
  const [comentarioRevision, setComentarioRevision] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const { instance, accounts } = useMsal();
  const { showLoading, hideLoading } = useLoading();



  const handleReview = async (action) => {
    showLoading(`Revisando compra...`);
    try {
      await revisarPremioCompra({
        id: selectedCompra.compraId, // ID de la compra seleccionada
        payload: {
          aprobar: action === "aprobado",
          comentarioRevision: comentarioRevision,
          aprobadorId: accounts[0]?.homeAccountId,
        }
      }
      );

      setSnackbar({
        open: true,
        message: `Compra ${action === "aprobado" ? "aprobada" : "rechazada"} correctamente.`,
        severity: "success",
      });

      // Actualiza la lista de compras eliminando la compra revisada
      setCompras((prev) => prev.filter((compra) => compra.compraId !== selectedCompra.compraId));
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error al ${action === "aprobado" ? "aprobar" : "rechazar"} la compra.`,
        severity: "error",
      });
    }
    hideLoading();
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchCompras = async () => {
    try {
      const data = await getPremiosCompras({
        filters: [{
          field: "Estado",
          operator: "eq",
          value: "pendiente",
        }],
        orderBy: "fechaCompra",
        orderDirection: "desc",
      });
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
  };

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
      valueGetter: (params) => params.nombre,
    },
    { field: "fechaCompra", headerName: "Fecha de Compra", width: 200 },
    { field: "estado", headerName: "Estado", width: 150 },
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
        sx={{
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
        }}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Detalles de la Compra</DialogTitle>
        <DialogContent>
          {selectedCompra && (
            <>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>ID de compra:</strong> {selectedCompra.compraId}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Solicitante:</strong>{" "}
                {colaboradores.find((col) => col.id === selectedCompra.tokenColaborador)?.displayName || selectedCompra.tokenColaborador}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Premio:</strong> {selectedCompra.premio?.nombre}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Descripción:</strong> {selectedCompra.premio?.descripcion}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Costo:</strong> {selectedCompra.premio?.costoWallet} puntos
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Fecha de compra:</strong>{" "}
                {new Date(selectedCompra.fechaCompra).toLocaleString("es-EC", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Estado:</strong> {selectedCompra.estado}
              </Typography>
              {selectedCompra.premio?.imagenUrl && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <img
                    src={selectedCompra.premio.imagenUrl}
                    alt="Imagen del premio"
                    style={{ maxHeight: 200, borderRadius: 8 }}
                  />
                </div>
              )}

              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Comentario de aprobación
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Ingrese un comentario para la aprobación o rechazo"
                  value={comentarioRevision}
                  onChange={(e) => setComentarioRevision(e.target.value)}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClose}
          >
            Cerrar
          </Button>
          <Box>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleReview("rechazado")}
              sx={{ mx: 1 }}
            >
              Rechazar
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleReview("aprobado")}
              sx={{ mx: 1 }}
            >
              Aceptar
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CRUDMarketplaceCompras;
