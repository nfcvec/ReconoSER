import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete } from "@mui/material";
import { getWalletBalance, updateWallet, otorgarBono } from "../../../utils/services/walletBalance";
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { getWalletTransaction } from '../../../utils/services/walletTransaccion';
import { getCategorias } from '../../../utils/services/categorias';
import { getWalletCategorias } from '../../../utils/services/walletCategorias';
import { useAlert } from "../../../contexts/AlertContext";
import { useLoading } from "../../../contexts/LoadingContext";
import EditIcon from '@mui/icons-material/Edit';

const CRUDWalletSaldos = () => {
    const [walletSaldos, setWalletSaldos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [walletCategorias, setWalletCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSaldo, setSelectedSaldo] = useState(null);
    const [bonoMonto, setBonoMonto] = useState(0);
    const [editOpen, setEditOpen] = useState(false);
    const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);
    const [walletTransacciones, setWalletTransacciones] = useState([]);
    const showAlert = useAlert();
    const { showLoading, hideLoading } = useLoading();

    // Utilidades para fetch
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            setWalletSaldos(await getWalletBalance());
        } catch (error) {
            showAlert("Error al cargar saldos", "error");
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    const fetchColaboradores = useCallback(async () => {
        if (!walletSaldos.length) return;
        try {
            const ids = [...new Set(walletSaldos.map(i => i.tokenColaborador))];
            setColaboradores(await getColaboradoresFromBatchIds(ids));
        } catch (error) {
            showAlert("Error al obtener colaboradores", "error");
        }
    }, [walletSaldos, showAlert]);

    useEffect(() => { (async () => setCategorias(await getCategorias().catch(() => showAlert('Error al obtener categorías', 'error'))))(); }, [showAlert]);
    useEffect(() => { (async () => setWalletCategorias(await getWalletCategorias().catch(() => showAlert('Error al obtener categorías de wallet', 'error'))))(); }, [showAlert]);
    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { if (walletSaldos.length) fetchColaboradores(); }, [walletSaldos, fetchColaboradores]);

    useEffect(() => {
        if (!colaboradorSeleccionado) return setWalletTransacciones([]);
        (async () => {
            setLoading(true);
            try {
                const filters = [{ field: "TokenColaborador", operator: "eq", value: colaboradorSeleccionado.id }];
                setWalletTransacciones(await getWalletTransaction(filters));
            } catch {
                showAlert('Error al obtener transacciones', 'error');
                setWalletTransacciones([]);
            } finally { setLoading(false); }
        })();
    }, [colaboradorSeleccionado, showAlert]);

    const handleEditClose = () => { setEditOpen(false); setSelectedSaldo(null); };
    const handleBonoSave = async () => {
        showLoading("Otorgando bono...");
        try {
            await otorgarBono(colaboradorSeleccionado.tokenColaborador || colaboradorSeleccionado.id, bonoMonto);
            await fetchData();
            const filters = [{ field: "TokenColaborador", operator: "eq", value: colaboradorSeleccionado.id }];
            setWalletTransacciones(await getWalletTransaction(filters));
            showAlert("Bono otorgado correctamente", "success");
        } catch {
            showAlert("Error al otorgar el bono", "error");
        } finally {
            hideLoading();
            setEditOpen(false);
        }
    };

    const columns = [
        { field: "walletSaldoId", headerName: "ID", width: 100 },
        {
            field: "tokenColaborador",
            headerName: "Colaborador",
            width: 250,
            renderCell: (params) => colaboradores.find(col => col.id === params.value)?.displayName || "Cargando...",
        },
        { field: "saldoActual", headerName: "Saldo Actual", width: 150 },
        {
            field: 'editar',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: () => (<EditIcon sx={{ cursor: 'pointer' }} color="primary" />),
        },
    ];

    const transaccionesColumns = [
        { field: 'transaccionId', headerName: 'ID', width: 100 },
        { field: 'cantidad', headerName: 'Cantidad', width: 120 },
        { field: 'descripcion', headerName: 'Descripción', width: 200 },
        { field: 'fecha', headerName: 'Fecha', width: 180 },
        {
            field: 'categoriaId',
            headerName: 'Categoría',
            width: 120,
            renderCell: (params) => walletCategorias.find(c => c.categoriaId === params.value)?.nombre || params.value
        },
    ];

    return (
        <Container>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h4">Administrar ULIs</Typography>
                <Button variant="contained" color="primary" onClick={() => setEditOpen(true)} disabled={!colaboradorSeleccionado}>Dar Bono</Button>
            </Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Selecciona un colaborador para visualizar sus transacciones y otorgar un bono</Typography>
            <Box sx={{ mb: 2, maxWidth: 400 }}>
                <Autocomplete
                    options={colaboradores}
                    getOptionLabel={o => o.displayName || o.id}
                    value={colaboradorSeleccionado}
                    onChange={(_, v) => setColaboradorSeleccionado(v)}
                    renderInput={params => <TextField {...params} label="Selecciona un colaborador" variant="outlined" />}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                />
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
            <Dialog open={editOpen} onClose={handleEditClose}>
                <DialogTitle>Otorgar Bono</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Typography>ID: {colaboradorSeleccionado?.walletSaldoId || colaboradorSeleccionado?.id}</Typography>
                        <Typography>Colaborador: {colaboradorSeleccionado?.displayName || colaboradorSeleccionado?.id}</Typography>
                        <TextField
                            label="Monto del Bono"
                            type="number"
                            value={bonoMonto}
                            onChange={e => setBonoMonto(Number(e.target.value))}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancelar</Button>
                    <Button onClick={handleBonoSave} variant="contained" color="primary" disabled={bonoMonto <= 0 || !colaboradorSeleccionado}>Otorgar Bono</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CRUDWalletSaldos;
