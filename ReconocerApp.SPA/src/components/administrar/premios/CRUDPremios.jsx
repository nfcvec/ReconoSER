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
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    getPremios,
    editPremio,
    deletePremio,
    createPremio,
} from "../../../utils/services/premios";
import { getOrganizaciones } from "../../../utils/services/organizaciones";
import { getCategorias } from "../../../utils/services/categorias";
import { useMsal } from "@azure/msal-react";
import { useAlert } from "../../../contexts/AlertContext";

const CRUDPremios = () => {
    const [premios, setPremios] = useState([]);
    const [categorias, setCategorias] = useState([]);
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
    const [organizacionId, setOrganizacionId] = useState(null);

    const { accounts } = useMsal();
    const showAlert = useAlert();

    useEffect(() => {
        const fetchOrganizacionId = async () => {
            const email = accounts[0]?.username || "";
            const domain = email.split("@")[1];
            try {
                const organizaciones = await getOrganizaciones();
                const org = organizaciones.find(
                    (o) => o?.dominioEmail?.toLowerCase() === domain.toLowerCase()
                );
                if (org) {
                    setOrganizacionId(org.organizacionId);
                } else {
                    showAlert("Organización no encontrada para el dominio: " + domain, "error");
                }
            } catch (error) {
                console.error("Error al obtener organizaciones:", error);
                showAlert("Error al obtener las organizaciones", "error");
            }
        };

        fetchOrganizacionId();
    }, [accounts, showAlert]);

    useEffect(() => {
        const fetchPremios = async () => {
            if (!organizacionId) return;
            try {
                const data = await getPremios();
                const filtered = data.filter((p) => p.organizacionId === organizacionId);
                setPremios(filtered);
            } catch (error) {
                console.error("Error al cargar los premios:", error);
                showAlert("Error al cargar los premios", "error");
            }
        };

        fetchPremios();
    }, [organizacionId, showAlert]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                setCategorias(data);
            } catch (error) {
                console.error("Error al cargar las categorías:", error);
                showAlert("Error al cargar las categorías", "error");
            }
        };

        fetchCategorias();
    }, [showAlert]);

    const handleOpenDialog = (premio = null) => {
        setSelectedPremio(premio);
        setFormValues(
            premio
                ? {
                    categoriaId: premio.categoria?.categoriaId || "",
                    nombre: premio.nombre || "",
                    descripcion: premio.descripcion || "",
                    costoWallet: premio.costoWallet || "",
                    imagenUrl: premio.imagenUrl || "",
                    cantidadActual: premio.cantidadActual || "",
                    ultimaActualizacion: premio.ultimaActualizacion || new Date().toISOString(),
                }
                : {
                    categoriaId: "",
                    nombre: "",
                    descripcion: "",
                    costoWallet: "",
                    imagenUrl: "",
                    cantidadActual: "",
                    ultimaActualizacion: new Date().toISOString(),
                }
        );
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPremio(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formValues,
                organizacionId: organizacionId,
                ultimaActualizacion: new Date().toISOString(),
            };

            payload.costoWallet = parseFloat(payload.costoWallet);
            payload.cantidadActual = parseInt(payload.cantidadActual, 10);

            if (selectedPremio) {
                await editPremio(selectedPremio.premioId, payload);
                showAlert("Premio editado correctamente", "success");
            } else {
                await createPremio(payload);
                showAlert("Premio creado correctamente", "success");
            }

            const data = await getPremios();
            setPremios(data.filter((p) => p.organizacionId === organizacionId));
            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar el premio:", error);
            showAlert("Error al guardar el premio", "error");
        }
    };

    const handleDelete = useCallback(
        async (id) => {
            try {
                await deletePremio(id);
                setPremios((prev) => prev.filter((p) => p.premioId !== id));
                showAlert("Premio eliminado correctamente", "success");
            } catch (error) {
                console.error("Error al eliminar el premio:", error);
                showAlert("Error al eliminar el premio", "error");
            }
        },
        [showAlert]
    );

    const columns = [
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
        { field: "costoWallet", headerName: "Costo Wallet", width: 150 },
        { field: "imagenUrl", headerName: "Imagen URL", width: 200 },
        { field: "cantidadActual", headerName: "Cantidad Actual", width: 150 },
        { field: "ultimaActualizacion", headerName: "Última Actualización", width: 200 },
        {
            field: "categoriaNombre",
            headerName: "Categoría",
            width: 200,
            renderCell: (params) => {
                return params.row?.categoria?.nombre || "No asignada";
            }
        },
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
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, width: "100%", overflow: "auto" }}>
                <h1>Administrar Premios</h1>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                    Añadir Premio
                </Button>
            </Box>
            <DataGrid
                rows={premios}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.premioId}
            />
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{selectedPremio ? "Editar Premio" : "Añadir Premio"}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="categoria-select-label">Categoría</InputLabel>
                        <Select
                            labelId="categoria-select-label"
                            name="categoriaId"
                            value={formValues.categoriaId}
                            onChange={handleChange}
                            label="Categoría"
                        >
                            {categorias.map((categoria) => (
                                <MenuItem key={categoria.categoriaId} value={categoria.categoriaId}>
                                    {categoria.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
