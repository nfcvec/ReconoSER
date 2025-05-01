import React, { useState, useEffect, useCallback, useContext } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import {
    getPremios,
    editPremio,
    deletePremio,
    createPremio,
} from "../../../utils/services/premios";
import { useMsal } from "@azure/msal-react";
import { AlertContext } from "../../../contexts/AlertContext"; // Importar el contexto de alertas

const CRUDPremios = () => {
    const [premios, setPremios] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPremio, setSelectedPremio] = useState(null);
    const [formValues, setFormValues] = useState({
        categoriaId: "",
        nombre: "",
        descripcion: "",
        costoWallet: "",
        imagenUrl: "",
        cantidadActual: "",
        ultimaActualizacion: "",
    });

    const { accounts } = useMsal();
    const { setAlert } = useContext(AlertContext); // Usar el contexto de alertas

    // Obtener OrganizacionId basado en el dominio del correo
    const getOrganizacionId = () => {
        const email = accounts[0]?.username || "";
        const domain = email.split("@")[1];
        if (domain === "example.com") return 1;
        if (domain === "another.com") return 2;
        return null;
    };

    const organizacionId = getOrganizacionId();

    // Cargar premios al montar el componente
    useEffect(() => {
        const fetchPremios = async () => {
            try {
                const data = await getPremios();
                setPremios(data);
            } catch (error) {
                console.error("Error al cargar los premios:", error);
                setAlert({ type: "error", message: "Error al cargar los premios." });
            }
        };
        fetchPremios();
    }, [setAlert]);

    // Manejar apertura del diálogo
    const handleOpenDialog = (premio = null) => {
        setSelectedPremio(premio);
        setFormValues(
            premio || {
                categoriaId: "",
                nombre: "",
                descripcion: "",
                costoWallet: "",
                imagenUrl: "",
                cantidadActual: "",
                ultimaActualizacion: "",
            }
        );
        setOpenDialog(true);
    };

    // Manejar cierre del diálogo
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPremio(null);
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar o editar premio
    const handleSave = async () => {
        try {
            const payload = { ...formValues, organizacionId };
            if (selectedPremio) {
                await editPremio(selectedPremio.premioId, payload);
                setAlert({ type: "success", message: "Premio editado correctamente." });
            } else {
                await createPremio(null, payload);
                setAlert({ type: "success", message: "Premio creado correctamente." });
            }
            const data = await getPremios();
            setPremios(data);
            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar el premio:", error);
            setAlert({ type: "error", message: "Error al guardar el premio." });
        }
    };

    // Eliminar premio
    const handleDelete = useCallback(
        async (id) => {
            try {
                await deletePremio(id);
                setPremios((prev) => prev.filter((premio) => premio.premioId !== id));
                setAlert({ type: "success", message: "Premio eliminado correctamente." });
            } catch (error) {
                console.error("Error al eliminar el premio:", error);
                setAlert({ type: "error", message: "Error al eliminar el premio." });
            }
        },
        [setAlert]
    );

    // Columnas de la tabla
    const columns = [
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
        { field: "costoWallet", headerName: "Costo Wallet", width: 150 },
        { field: "imagenUrl", headerName: "Imagen URL", width: 200 },
        { field: "cantidadActual", headerName: "Cantidad Actual", width: 150 },
        { field: "ultimaActualizacion", headerName: "Última Actualización", width: 200 },
        {
            field: "actions",
            headerName: "Acciones",
            type: "actions",
            width: 150,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenDialog(params.row)}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Eliminar"
                    onClick={() => handleDelete(params.id)}
                />,
            ],
        },
    ];

    return (
        <Container>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <h1>Administrar Premios</h1>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                    Añadir Premio
                </Button>
            </Box>
            <DataGrid
                rows={premios}
                columns={columns}
                autoHeight
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.premioId}
            />
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedPremio ? "Editar Premio" : "Añadir Premio"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Categoría ID"
                        name="categoriaId"
                        fullWidth
                        value={formValues.categoriaId}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Nombre"
                        name="nombre"
                        fullWidth
                        value={formValues.nombre}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Descripción"
                        name="descripcion"
                        fullWidth
                        value={formValues.descripcion}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Costo Wallet"
                        name="costoWallet"
                        fullWidth
                        value={formValues.costoWallet}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Imagen URL"
                        name="imagenUrl"
                        fullWidth
                        value={formValues.imagenUrl}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Cantidad Actual"
                        name="cantidadActual"
                        fullWidth
                        value={formValues.cantidadActual}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Última Actualización"
                        name="ultimaActualizacion"
                        fullWidth
                        value={formValues.ultimaActualizacion}
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

export default CRUDPremios;