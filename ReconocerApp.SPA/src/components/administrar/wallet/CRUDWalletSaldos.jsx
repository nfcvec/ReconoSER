import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Container, Typography } from "@mui/material";
import { getWalletBalance } from "../../../utils/services/walletBalance";
import { getColaboradoresFromBatchIds } from "../../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";
import { getOrganizaciones } from "../../../utils/services/organizaciones";

const CRUDWalletSaldos = () => {
    const [walletSaldos, setWalletSaldos] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [organizacionId, setOrganizacionId] = useState(null);
    const [loading, setLoading] = useState(false);

    const { instance, accounts } = useMsal();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getWalletBalance();
            setWalletSaldos(data);
        } catch (error) {
            console.error("Error al cargar saldos:", error);
        } finally {
            setLoading(false);
        }
    }, [organizacionId]);

    const fetchColaboradores = useCallback(async () => {
        if (walletSaldos.length === 0) return;

        try {
            const ids = walletSaldos.map((item) => item.tokenColaborador);
            const uniqueIds = [...new Set(ids)];
            const users = await getColaboradoresFromBatchIds(uniqueIds, instance, accounts);
            setColaboradores(users);
        } catch (error) {
            console.error("Error al obtener colaboradores:", error);
        }
    }, [walletSaldos, instance, accounts]);

    useEffect(() => {
        fetchData();
    }, [organizacionId, fetchData]);

    useEffect(() => {
        if (walletSaldos.length > 0) {
            fetchColaboradores();
        }
    }, [walletSaldos, fetchColaboradores]);

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
            field: "organizacionId",
            headerName: "Organización ID",
            width: 150
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
            />
        </Container>
    );
};

export default CRUDWalletSaldos;
