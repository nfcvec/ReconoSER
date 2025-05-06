import React, { useState, useEffect, useCallback } from "react";
import {
    DataGrid,
    GridActionsCellItem,
} from "@mui/x-data-grid";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Box,
    Container,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
    getWalletBalance,
    createWallet,
    updateWallet,
} from "../../../utils/services/walletBalance";
import { useMsal } from "@azure/msal-react";
import { getColaboradores } from "../../../utils/services/colaboradores";
import { getOrganizaciones } from "../../../utils/services/organizaciones";


const CRUDWalletSaldos = () => {
    const [walletSaldos, setWalletSaldos] = useState([]);
    const [colaboradores, setColaboradores] = useState({});
    const [openDialog, setOpenDialog] = useState(false);
    const [selected, setSelected] = useState(null);
    const [formValues, setFormValues] = useState({
        walletSaldoId: "",
        tokenColaborador: "",
        saldoActual: 0,
    });

    const { instance, accounts } = useMsal();

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getWalletBalance();
                setWalletSaldos(data);
            } catch (error) {
                console.error("Error al cargar saldos:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                const response = await instance.acquireTokenSilent({
                    account: accounts[0],
                    scopes: ["User.Read.All"],
                });

                const users = await getColaboradores(response.accessToken);
                const map = {};
                users.forEach((user) => {
                    map[user.id] = user.displayName;
                });
                setColaboradores(map);
            } catch (error) {
                console.error("Error al obtener colaboradores:", error);
            }
        };
        fetchColaboradores();
    }, [instance, accounts]);

    const handleOpenDialog = (item = null) => {
        setSelected(item);
        setFormValues(
            item || {
                walletSaldoId: item?.walletSaldoId || "",
                tokenColaborador: item?.tokenColaborador || "",
                saldoActual: item?.saldoActual || 0,
            }
        );
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelected(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: name === "saldoActual" ? parseFloat(value) : value,
        }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                walletSaldoId: Number(formValues.walletSaldoId),
                tokenColaborador: String(formValues.tokenColaborador),
                saldoActual: Number(formValues.saldoActual),
            };

            if (selected) {
                await updateWallet(payload.walletSaldoId, payload);
            } else {
                await createWallet(payload);
            }

            const updated = await getWalletBalance();
            setWalletSaldos(updated);
            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };


    const columns = [
        { field: "walletSaldoId", headerName: "ID", width: 100 },
        {
            field: "tokenColaborador",
            headerName: "Colaborador",
            width: 250,
            renderCell: (params) => colaboradores[params.value] || params.value,
        },
        { field: "saldoActual", headerName: "Saldo Actual", width: 150 },
        {
            field: "actions",
            headerName: "Acciones",
            type: "actions",
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenDialog(params.row)}
                />,
            ],
        },
    ];

    return (
        <Container>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <h1>Administrar Saldos de Billetera</h1>
                {/* <Button variant="contained" onClick={() => handleOpenDialog()}>
          Añadir Saldo
        </Button> */}
            </Box>
            <DataGrid
                rows={walletSaldos}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.walletSaldoId}
                autoHeight
            />
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{selected ? "Editar" : "Añadir"} Saldo</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Colaborador ID"
                        name="tokenColaborador"
                        fullWidth
                        value={formValues.tokenColaborador}
                        onChange={handleChange}
                        disabled={!!selected}
                    />
                    <TextField
                        margin="dense"
                        label="Saldo Actual"
                        name="saldoActual"
                        fullWidth
                        type="number"
                        value={formValues.saldoActual}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CRUDWalletSaldos;
