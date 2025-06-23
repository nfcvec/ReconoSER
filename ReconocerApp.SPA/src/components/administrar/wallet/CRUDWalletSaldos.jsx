import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import {
  getWalletBalance, otorgarBono, corregirSaldo
} from "../../../utils/services/walletBalance";
import { getColaboradores } from "../../../utils/services/colaboradores";
import { getWallets, getWalletTransaction } from '../../../utils/services/walletTransaccion';
import { getWalletCategorias } from '../../../utils/services/walletCategorias';
import { useAlert } from "../../../contexts/AlertContext";
import { useLoading } from "../../../contexts/LoadingContext";
import { useWallet } from "../../../contexts/WalletContext";
import { useOrganizacion } from '../../../contexts/OrganizacionContext';
import FechaFormateada from '../../../ui-components/FechaFormateada';

const CRUDWalletSaldos = () => {
  const [walletSaldos, setWalletSaldos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [walletCategorias, setWalletCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bonoMonto, setBonoMonto] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);
  const [walletTransacciones, setWalletTransacciones] = useState([]);
  const [walletColaborador, setWalletColaborador] = useState(null);
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [ajusteMonto, setAjusteMonto] = useState(0);
  const [ajusteCategoria, setAjusteCategoria] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const showAlert = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const { refreshWallet } = useWallet();
  const { organizacion } = useOrganizacion();

  // Fetch wallet balances
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setWalletSaldos(await getWalletBalance());
    } catch {
      showAlert("Error al cargar saldos", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  // Buscar colaboradores por searchTerm
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        setColaboradores(await getColaboradores(searchTerm));
      } catch {
        showAlert("Error al obtener colaboradores", "error");
      }
    };
    fetchColaboradores();
  }, [searchTerm, showAlert]);

  // Fetch wallet categories
  useEffect(() => {
    getWalletCategorias().then(setWalletCategorias).catch(() => showAlert('Error al obtener categorías de wallet', 'error'));
  }, [showAlert]);
  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch transactions for selected collaborator
  useEffect(() => {
    if (!colaboradorSeleccionado) return setWalletTransacciones([]);
    (async () => {
      setLoading(true);
      try {
        const filters = [{ field: "TokenColaborador", operator: "eq", value: colaboradorSeleccionado.id }];
        let wallets = await getWallets(filters);
        if (wallets.length === 0) {
          showAlert("No se encontraron transacciones para el colaborador seleccionado", "info");
          setWalletColaborador(null);
          return;
        }
        setWalletColaborador(wallets[0]);
      }
      catch {
        showAlert("Error al obtener el saldo del colaborador", "error");
        setWalletColaborador(null);
      }
      finally { setLoading(false); }
      try {
        const filters = [{ field: "TokenColaborador", operator: "eq", value: colaboradorSeleccionado.id }];
        let transacciones = await getWalletTransaction(filters);
        setWalletTransacciones(transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      } catch {
        showAlert('Error al obtener transacciones', 'error');
        setWalletTransacciones([]);
      } finally { setLoading(false); }
    })();
  }, [colaboradorSeleccionado, showAlert]);

  // Bono handler
  const handleBonoSave = async () => {
    showLoading("Otorgando bono...");
    try {
      await otorgarBono(colaboradorSeleccionado.tokenColaborador || colaboradorSeleccionado.id, bonoMonto);
      await refreshWallet();
      await fetchData();
      const filters = [{ field: "TokenColaborador", operator: "eq", value: colaboradorSeleccionado.id }];
      let transacciones = await getWalletTransaction(filters);
      setWalletTransacciones(transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      showAlert("Bono otorgado correctamente", "success");
    } catch {
      showAlert("Error al otorgar el bono", "error");
    } finally {
      hideLoading();
      setEditOpen(false);
    }
  };

  // Ajuste handler
  const handleAjusteULIs = async () => {
    showLoading("Realizando ajuste de ULIs...");
    try {
      await corregirSaldo(
        colaboradorSeleccionado.tokenColaborador || colaboradorSeleccionado.id,
        ajusteMonto,
        ajusteCategoria
      );
      await refreshWallet();
      await fetchData();
      const filters = [{ field: "TokenColaborador", operator: "eq", value: colaboradorSeleccionado.id }];
      let transacciones = await getWalletTransaction(filters);
      setWalletTransacciones(transacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
      showAlert("Ajuste realizado correctamente", "success");
      setAjusteOpen(false);
      setAjusteMonto(0);
      setAjusteCategoria("");
    } catch {
      showAlert("Error al realizar el ajuste", "error");
    } finally {
      hideLoading();
    }
  };

  // Categorías de ajuste
  const categoriasAjuste = walletCategorias.filter(cat => cat.nombre?.toLowerCase().includes("ajuste"));

  // Columnas para DataGrid
  const transaccionesColumns = [
    { field: 'transaccionId', headerName: 'ID', width: 100 },
    { field: 'cantidad', headerName: 'Cantidad', width: 120 },
    { field: 'descripcion', headerName: 'Descripción', width: 200 },
    {
      field: 'fecha',
      headerName: 'Fecha',
      width: 180,
      renderCell: (params) => <FechaFormateada value={params.value} />
    },
    {
      field: 'categoriaId',
      headerName: 'Categoría',
      width: 120,
      renderCell: (params) => walletCategorias.find(c => c.categoriaId === params.value)?.nombre || params.value
    },
  ];

  // Obtener saldo actual del colaborador seleccionado
  const saldoActual = colaboradorSeleccionado
    ? (walletSaldos.find(s => String(s.tokenColaborador) === String(colaboradorSeleccionado.tokenColaborador) || String(s.tokenColaborador) === String(colaboradorSeleccionado.id))?.saldoActual ?? 0)
    : '--';

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Administrar ULIs</Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={() => setEditOpen(true)} disabled={!colaboradorSeleccionado} sx={{ mr: 1 }}>
            Dar ULIs
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setAjusteOpen(true)} disabled={!colaboradorSeleccionado}>
            Ajuste de ULIs
          </Button>
        </Box>
      </Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Selecciona un colaborador para visualizar sus transacciones y otorgar un bono</Typography>
      <Box sx={{ mb: 2, maxWidth: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Autocomplete
          options={colaboradores}
          getOptionLabel={o => o.displayName || o.id}
          value={colaboradorSeleccionado}
          onChange={(_, v) => setColaboradorSeleccionado(v)}
          renderInput={params => (
            <TextField {...params} label="Selecciona un colaborador" variant="outlined" onChange={e => setSearchTerm(e.target.value)} />
          )}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          sx={{ minWidth: 300 }}
        />
        {/* Recuadro para ULIs con color de la organización activa */}
        <Box
          sx={{
            background: organizacion?.colorPrincipal || '#1976d2',
            color: '#fff',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            minWidth: 150,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: 2,
            justifyContent: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>ULIs:</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {walletColaborador ? walletColaborador.saldoActual : '--'}
          </Typography>
        </Box>
      </Box>
      <DataGrid
        rows={walletTransacciones}
        columns={transaccionesColumns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={row => row.transaccionId}
        loading={loading}
        sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
      />
      {/* Dialog Bono */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Dar ULIs</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography>ID: {colaboradorSeleccionado?.walletSaldoId || colaboradorSeleccionado?.id}</Typography>
            <Typography>Colaborador: {colaboradorSeleccionado?.displayName || colaboradorSeleccionado?.id}</Typography>
            <TextField
              label="Monto de ULIs"
              type="number"
              value={bonoMonto}
              onChange={e => setBonoMonto(Number(e.target.value))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={handleBonoSave} variant="contained" color="primary" disabled={bonoMonto <= 0 || !colaboradorSeleccionado}>Dar ULIs</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog Ajuste */}
      <Dialog open={ajusteOpen} onClose={() => setAjusteOpen(false)}>
        <DialogTitle>Ajuste de ULIs</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography>ID: {colaboradorSeleccionado?.walletSaldoId || colaboradorSeleccionado?.id}</Typography>
            <Typography>Colaborador: {colaboradorSeleccionado?.displayName || colaboradorSeleccionado?.id}</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="ajuste-categoria-label">Tipo de Ajuste</InputLabel>
              <Select
                labelId="ajuste-categoria-label"
                value={ajusteCategoria}
                label="Tipo de Ajuste"
                onChange={e => setAjusteCategoria(e.target.value)}
              >
                {categoriasAjuste.map(cat => (
                  <MenuItem key={cat.categoriaId} value={cat.categoriaId}>{cat.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Monto a Ajustar"
              type="number"
              value={ajusteMonto}
              onChange={e => setAjusteMonto(Number(e.target.value))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAjusteOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="primary" disabled={ajusteMonto === 0 || !ajusteCategoria || !colaboradorSeleccionado} onClick={handleAjusteULIs}>
            Ajustar ULIs
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CRUDWalletSaldos;
