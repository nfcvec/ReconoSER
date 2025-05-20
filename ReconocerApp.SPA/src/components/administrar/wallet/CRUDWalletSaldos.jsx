import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete } from "@mui/material";
import { getWalletBalance, updateWallet, otorgarBono } from "../../../utils/services/walletBalance";
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { getWalletTransaction } from '../../../utils/services/walletTransaccion';
import { getCategorias } from '../../../utils/services/categorias';
import { useAlert } from "../../../contexts/AlertContext";
import { useLoading } from "../../../contexts/LoadingContext";
import EditIcon from '@mui/icons-material/Edit';

const CRUDWalletSaldos = () => {
    const [walletSaldos, setWalletSaldos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSaldo, setSelectedSaldo] = useState(null);
    const [bonoMonto, setBonoMonto] = useState(0);
    const [editOpen, setEditOpen] = useState(false);
    const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null);
    const [walletTransacciones, setWalletTransacciones] = useState([]);

    const showAlert = useAlert();
    const { showLoading, hideLoading } = useLoading();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getWalletBalance();
            console.log('Datos obtenidos de getWalletBalance:', data);
            setWalletSaldos(data);
        } catch (error) {
            showAlert("Error al cargar saldos", "error");
            console.error("Error al cargar saldos:", error);
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    const fetchColaboradores = useCallback(async () => {
        if (walletSaldos.length === 0) return;
        try {
            const ids = walletSaldos.map((item) => item.tokenColaborador);
            const uniqueIds = [...new Set(ids)];
            const users = await getColaboradoresFromBatchIds(uniqueIds);
            setColaboradores(users);
        } catch (error) {
            showAlert("Error al obtener colaboradores", "error");
            console.error("Error al obtener colaboradores:", error);
        }
    }, [walletSaldos, showAlert]);

    // Obtener categorías al montar el componente
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                setCategorias(data);
            } catch (error) {
                showAlert('Error al obtener categorías', 'error');
            }
        };
        fetchCategorias();
    }, [showAlert]);

    // Cuando se selecciona un colaborador, obtener las transacciones de su wallet
    useEffect(() => {
        const fetchTransacciones = async () => {
            if (colaboradorSeleccionado) {
                setLoading(true);
                try {
                    // Filtrar por TokenColaborador
                    const filters = [{ field: "TokenColaborador", operator: "eq", value: colaboradorSeleccionado.id }];
                    const transacciones = await getWalletTransaction(filters);
                    setWalletTransacciones(transacciones);
                } catch (error) {
                    showAlert('Error al obtener transacciones', 'error');
                    setWalletTransacciones([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setWalletTransacciones([]);
            }
        };
        fetchTransacciones();
    }, [colaboradorSeleccionado, walletSaldos, showAlert]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        console.log('walletSaldos después de fetchData:', walletSaldos);
        if (walletSaldos.length > 0) {
            fetchColaboradores();
        }
    }, [walletSaldos, fetchColaboradores]);

    const handleRowClick = (params) => {
        setSelectedSaldo(params.row);
        setBonoMonto(0);
        setEditOpen(true);
    };

    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedSaldo(null);
    };

    const handleBonoSave = async () => {
        showLoading("Otorgando bono...");
        try {
            // Usar el colaborador seleccionado para otorgar el bono
            await otorgarBono(colaboradorSeleccionado.tokenColaborador || colaboradorSeleccionado.id, bonoMonto);
            await fetchData(); // Refrescar la tabla
            showAlert("Bono otorgado correctamente", "success");
        } catch (error) {
            console.error("Error real al otorgar bono:", error);
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
            renderCell: (params) => colaboradores.find((col) => col.id === params.value)?.displayName || "Cargando...",
        },
        { field: "saldoActual", headerName: "Saldo Actual", width: 150 },
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

    // Columnas para transacciones
    const transaccionesColumns = [
        { field: 'transaccionId', headerName: 'ID', width: 100 },
        { field: 'cantidad', headerName: 'Cantidad', width: 120 },
        { field: 'descripcion', headerName: 'Descripción', width: 200 },
        { field: 'fecha', headerName: 'Fecha', width: 180 },
        {
            field: 'categoriaId',
            headerName: 'Categoría',
            width: 120,
            renderCell: (params) => {
                const cat = categorias.find(c => c.categoriaId === params.value);
                return cat ? cat.nombre : params.value;
            }
        },
    ];

    const filteredWalletSaldos = colaboradorSeleccionado
    ? walletSaldos.filter((item) => item.tokenColaborador === colaboradorSeleccionado.id)
    : [];

    return (
        <Container>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h4">Administrar ULIs</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setEditOpen(true)}
                    disabled={!colaboradorSeleccionado}
                >
                    Dar Bono
                </Button>
            </Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Selecciona un colaborador para visualizar sus transacciones y otorgar un bono
            </Typography>
            <Box sx={{ mb: 2, maxWidth: 400 }}>
                <Autocomplete
                    options={colaboradores}
                    getOptionLabel={(option) => option.displayName || option.id}
                    value={colaboradorSeleccionado}
                    onChange={(_, value) => setColaboradorSeleccionado(value)}
                    renderInput={(params) => (
                        <TextField {...params} label="Selecciona un colaborador" variant="outlined" />
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                />
            </Box>
            <DataGrid
                rows={walletTransacciones}
                columns={transaccionesColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.transaccionId}
                loading={loading}
                sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold',
                    },
                  }}
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
                            onChange={(e) => setBonoMonto(Number(e.target.value))}
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
