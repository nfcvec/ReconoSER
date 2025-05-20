import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Container, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { getWalletBalance, updateWallet, otorgarBono } from "../../../utils/services/walletBalance";
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { useAlert } from "../../../contexts/AlertContext";
import { useLoading } from "../../../contexts/LoadingContext";
import EditIcon from '@mui/icons-material/Edit';

const CRUDWalletSaldos = () => {
    const [walletSaldos, setWalletSaldos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSaldo, setSelectedSaldo] = useState(null);
    const [bonoMonto, setBonoMonto] = useState(0);
    const [editOpen, setEditOpen] = useState(false);

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
            // Llamar al endpoint de recarga de bono
            await otorgarBono(selectedSaldo.tokenColaborador, bonoMonto);
            await fetchData(); // Refrescar la tabla
            showAlert("Bono otorgado correctamente", "success");
        } catch (error) {
            console.error("Error real al otorgar bono:", error);
            showAlert("Error al otorgar el bono", "error");
        } finally {
            hideLoading();
            setEditOpen(false);
            setSelectedSaldo(null);
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

    return (
        <Container>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h4">Administrar ULIs</Typography>
            </Box>
            <DataGrid
                rows={walletSaldos}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.walletSaldoId}
                loading={loading}
                sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold',
                    },
                  }}
                onRowClick={handleRowClick}
            />
            <Dialog open={editOpen} onClose={handleEditClose}>
                <DialogTitle>Otorgar Bono</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Typography>ID: {selectedSaldo?.walletSaldoId}</Typography>
                        <Typography>Colaborador: {colaboradores.find((col) => col.id === selectedSaldo?.tokenColaborador)?.displayName || selectedSaldo?.tokenColaborador}</Typography>
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
                    <Button onClick={handleBonoSave} variant="contained" color="primary" disabled={bonoMonto <= 0}>Otorgar Bono</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CRUDWalletSaldos;
