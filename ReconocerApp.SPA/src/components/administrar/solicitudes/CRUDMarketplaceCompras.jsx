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
  Box,
  TextField,
  Divider,
  ImageList,
  ImageListItem,
} from "@mui/material";
import {
  getPremiosCompras,
  revisarPremioCompra,
} from "../../../utils/services/premiosCompra";
import { getPremioImages } from "../../../utils/services/premios"; // Importar la función para obtener imágenes
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { useLoading } from "../../../contexts/LoadingContext";
import { useMsal } from "@azure/msal-react";
import { useAlert } from "../../../contexts/AlertContext";
import EditIcon from '@mui/icons-material/Edit';
import { useWallet } from "../../../contexts/WalletContext";
import FechaFormateada from '../../../ui-components/FechaFormateada';

const CRUDMarketplaceCompras = () => {
  const [compras, setCompras] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [imagenes, setImagenes] = useState([]); // Para todas las imágenes del premio
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [open, setOpen] = useState(false);
  const [comentarioRevision, setComentarioRevision] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const { instance } = useMsal();
  const showAlert = useAlert();
  const { refreshWallet } = useWallet();

  const handleReview = async (action) => {
    showLoading(`Revisando compra...`);
    try {
      console.log('selectedCompra:', selectedCompra); // <-- LOG para depuración
      await revisarPremioCompra({
        id: selectedCompra?.compraId, // <-- Aseguramos que se pase el ID correcto y con el nombre esperado
        payload: {
          aprobar: action === "aprobado",
          comentarioRevision: comentarioRevision,
          aprobadorId: instance.getActiveAccount()?.homeAccountId,
        }
      });

      await refreshWallet(); // Refresca el saldo después de aprobar o rechazar
      showAlert(`Compra ${action === "aprobado" ? "aprobada" : "rechazada"} correctamente.`, "success");

      // Actualiza la lista de compras eliminando la compra revisada
      setCompras((prev) => prev.filter((compra) => compra.compraId !== selectedCompra.compraId));
      handleClose();
    } catch (error) {
      showAlert(`Error al ${action === "aprobado" ? "aprobar" : "rechazar"} la compra.`, "error");
    }
    hideLoading();
  };

  const handleClose = () => {
    setOpen(false);
    setImagenes([]); // Limpiar las imágenes al cerrar el diálogo
  };

  const fetchCompras = async () => {
    try {
      const data = await getPremiosCompras({
        filters: [{
          field: "Estado",
          operator: "eq",
          value: "Pendiente",
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
    const data = await getColaboradoresFromBatchIds(uniqueIds);
    setColaboradores(data);
  };

  const fetchPremioImages = async (premioId) => {
    try {
      const images = await getPremioImages(premioId);
      setImagenes(images);
    } catch (error) {
      setImagenes([]);
    }
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
    {
      field: "fechaCompra",
      headerName: "Fecha de Compra",
      width: 200,
      renderCell: (params) => <FechaFormateada value={params.value} />
    },
    {
      field: 'editar',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: () => (
        <EditIcon sx={{ cursor: 'pointer' }} color="primary" />
      ),
    },
  ];

  return (
    <Container>
      <Typography variant="h4">Revisar solicitudes de compra</Typography>
      <Typography variant="h5" sx={{ mt: 2 }} padding={2}>
        Tienes {compras.length} solicitud/es de compra pendientes, da click en ellas para revisar.
      </Typography>
      <DataGrid
        rows={compras}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.compraId}
        onRowClick={(params) => {
          if (params.row) {
            setSelectedCompra(params.row);
            fetchPremioImages(params.row.premioId); // Cargar todas las imágenes del premio seleccionado
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
                <strong>Solicitante:</strong>{" "}
                {`${colaboradores.find((col) => col.id === selectedCompra.tokenColaborador)?.displayName} - ${colaboradores.find((col) => col.id === selectedCompra.tokenColaborador)?.mail}` || selectedCompra.tokenColaborador}
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
                <FechaFormateada value={selectedCompra.fechaCompra} />
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Comentario:</strong>{" "}
                {selectedCompra?.comentario || "No hay comentario"}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Estado:</strong> {selectedCompra.estado}
              </Typography>
              {/* Mostrar galería de imágenes si hay imágenes */}
              {imagenes && Array.isArray(imagenes) && imagenes.length > 0 && (
                <Box sx={{ my: 2 }}>
                  <ImageList sx={{ width: 500, height: 200 }} cols={3} rowHeight={120}>
                    {imagenes.map((img, idx) => (
                      <ImageListItem key={idx}>
                        <img
                          src={`data:image/jpeg;base64,${img.content}`}
                          alt={`Premio imagen ${idx + 1}`}
                          loading="lazy"
                          style={{ objectFit: "contain", width: "100%", height: "100%", cursor: "pointer" }}
                          onClick={() => {
                            setSelectedImg(`data:image/jpeg;base64,${img.content}`);
                            setDialogOpen(true);
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}
              <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md">
                <Box sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "background.paper" }}>
                  {selectedImg && (
                    <img src={selectedImg} alt="Imagen grande" style={{ maxWidth: "80vw", maxHeight: "80vh" }} />
                  )}
                </Box>
              </Dialog>

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
    </Container>
  );
};

export default CRUDMarketplaceCompras;