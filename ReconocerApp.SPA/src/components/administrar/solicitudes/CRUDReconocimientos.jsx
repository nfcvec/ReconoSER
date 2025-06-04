import React, { useState, useEffect } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  getReconocimientos,
  reviewReconocimiento
} from "../../../utils/services/reconocimientos";
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";
import { useLoading } from "../../../contexts/LoadingContext";
import { useAlert } from "../../../contexts/AlertContext";
import EditIcon from '@mui/icons-material/Edit';
import { useWallet } from "../../../contexts/WalletContext";
import FechaFormateada from '../../../ui-components/FechaFormateada';

const CRUDReconocimientos = () => {
  const [reconocimientos, setReconocimientos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReconocimiento, setSelectedReconocimiento] = useState(null);
  const [comentarioAprobacion, setComentarioAprobacion] = useState("");
  const [generaULIS, setGeneraULIs] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { instance } = useMsal();
  const { showLoading, hideLoading } = useLoading();
  const showAlert = useAlert();
  const { refreshWallet } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReconocimientos({
          filters: [
            {
              field: "Estado",
              operator: "eq",
              value: "Pendiente",
            }
          ],
          page: 1,
          pageSize: 100
        });
        setReconocimientos(data);
      } catch (error) {
        console.error("Error al cargar los reconocimientos:", error);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    console.log("Reconocimientos:", reconocimientos);
    const fetchColaboradores = async () => {
      try {
        let ids = [...new Set(reconocimientos.map((rec) => rec.reconocedorId))];
        ids = [...ids, ...reconocimientos.map((rec) => rec.reconocidoId)];
        // distinct ids
        ids = [...new Set(ids)];
        const users = await getColaboradoresFromBatchIds(ids);
        setColaboradores(users);
      } catch (error) {
        console.error("Error al obtener colaboradores:", error);
      }
    };
    fetchColaboradores();
  }, [reconocimientos]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReconocimiento(null);
    setComentarioAprobacion('');
  };

  const handleReview = async (action) => {
    showLoading(action === "aprobado" ? "Aprobando reconocimiento..." : "Rechazando reconocimiento...");
    setIsLoading(true);
    try {
      const payload = {
        aprobar: action === "aprobado",
        comentarioAprobacion,
        aprobadorId: instance.getActiveAccount()?.homeAccountId,
        generarULIs: generaULIS
      }
      await reviewReconocimiento(selectedReconocimiento.reconocimientoId, payload);
      await refreshWallet(); // Refresca el saldo después de aprobar o rechazar
      showAlert(`Reconocimiento ${action === "aprobado" ? "aprobado" : "rechazado"} correctamente.`, "success");
      setReconocimientos((prev) =>
        prev.filter((rec) => rec.reconocimientoId !== selectedReconocimiento.reconocimientoId)
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Error al revisar el reconocimiento:", error);
      showAlert(`Error al ${action === "aprobado" ? "aprobar" : "rechazar"} el reconocimiento.`, "error");
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const columns = [
    {
      field: "reconocedorId",
      headerName: "Reconocedor",
      width: 250,
      renderCell: (params) => colaboradores.find((colaborador) => colaborador.id === params.value)?.displayName || params.value,
    },
    {
      field: "reconocidoId",
      headerName: "Reconocido",
      width: 250,
      renderCell: (params) => colaboradores.find((colaborador) => colaborador.id === params.value)?.displayName || params.value,
    },
    { field: "justificacion", headerName: "Justificación", width: 250 },
    { field: "estado", headerName: "Estado", width: 150 },
    { field: "fechaCreacion", headerName: "Fecha de creación", width: 200, renderCell: (params) => <FechaFormateada value={params.value} /> },
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Revisar reconocimientos
        </Typography>
        <Typography variant="h5" color="textSecondary">
          Tienes {reconocimientos.length} solicitudes pendientes
        </Typography>
      </Box>
      <DataGrid
        getRowId={(row) => row.reconocimientoId}
        rows={reconocimientos}
        columns={columns}
        disableColumnFilter={true}
        disableColumnSelector={true}
        disableColumnSorting={true}
        onRowClick={(params) => {
          setSelectedReconocimiento(params.row);
          setOpenDialog(true);
        }}
        sx={{
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
        }}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Detalles del Reconocimiento
        </DialogTitle>
        <DialogContent>
          {selectedReconocimiento && (
            <>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Solicitante:</strong> {`${colaboradores.find((colaborador) => colaborador.id === selectedReconocimiento.reconocedorId)?.displayName} - ${colaboradores.find((colaborador) => colaborador.id === selectedReconocimiento.reconocedorId)?.mail}` || selectedReconocimiento.reconocedorId}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Reconocido:</strong> {`${colaboradores.find((colaborador) => colaborador.id === selectedReconocimiento.reconocidoId)?.displayName} - ${colaboradores.find((colaborador) => colaborador.id === selectedReconocimiento.reconocidoId)?.mail}` || selectedReconocimiento.reconocidoId}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Justificación:</strong> {selectedReconocimiento.justificacion}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Certificado:</strong> {selectedReconocimiento.texto}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Estado:</strong> {selectedReconocimiento.estado}
              </Typography>
              <Typography variant="body1" sx={{ my: 1 }}>
                <strong>Fecha de creación:</strong> <FechaFormateada value={selectedReconocimiento.fechaCreacion} />
              </Typography>

              {selectedReconocimiento.comportamientos && selectedReconocimiento.comportamientos.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Comportamientos seleccionados
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={generaULIS}
                        onChange={(e) => setGeneraULIs(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Generar ULIs"
                    sx={{ mb: 1 }}
                  />

                  <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Valor</strong></TableCell>
                          <TableCell><strong>Comportamiento</strong></TableCell>
                          {generaULIS && (
                            <TableCell align="center"><strong>ULIs</strong></TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedReconocimiento.comportamientos.map((comportamiento) => (
                          <TableRow key={comportamiento.comportamientoId}>
                            <TableCell>{comportamiento.nombre}</TableCell>
                            <TableCell>{comportamiento.descripcion}</TableCell>
                            {generaULIS && (
                              <TableCell align="center">{comportamiento.walletOtorgados}</TableCell>
                            )}
                          </TableRow>
                        ))}
                        {generaULIS && (
                          <TableRow>
                            <TableCell colSpan={2} align="right">
                              <strong>Total ULIs:</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>
                                {selectedReconocimiento.comportamientos.reduce(
                                  (total, comportamiento) => total + comportamiento.walletOtorgados,
                                  0
                                )}
                              </strong>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Comentario de aprobación
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Ingrese un comentario para la aprobación o rechazo"
                      value={comentarioAprobacion}
                      onChange={(e) => setComentarioAprobacion(e.target.value)}
                    />
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCloseDialog}
            disabled={isLoading}
          >
            Cerrar
          </Button>
          <Box>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleReview("rechazado")}
              disabled={!comentarioAprobacion || isLoading}
              sx={{ mx: 1 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Rechazar"}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick= {() => handleReview("aprobado")}
              disabled={isLoading}
              sx={{ mx: 1 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "Aceptar"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CRUDReconocimientos;
