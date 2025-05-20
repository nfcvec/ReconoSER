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
    Snackbar,
    Alert,
    MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    getComportamientos,
    createComportamiento,
    updateComportamiento,
    deleteComportamiento,
} from "../../../utils/services/comportamientos";
import { getOrganizaciones } from "../../../utils/services/organizaciones";

const defaultForm = { nombre: "", descripcion: "", walletOtorgados: 0, organizacionId: 1 };

const CRUDComportamientos = () => {
    const [comportamientos, setComportamientos] = useState([]);
    const [organizaciones, setOrganizaciones] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedComportamiento, setSelectedComportamiento] = useState(null);
    const [formValues, setFormValues] = useState(defaultForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Cargar comportamientos y organizaciones al montar el componente
    useEffect(() => {
        (async () => {
            try {
                const [comps, orgs] = await Promise.all([
                    getComportamientos({}),
                    getOrganizaciones()
                ]);
                setComportamientos(comps);
                setOrganizaciones(orgs);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        })();
    }, []);

    // Manejar apertura del diálogo
    const handleOpenDialog = (comportamiento = null) => {
        setSelectedComportamiento(comportamiento);
        setFormValues(comportamiento || defaultForm);
        setOpenDialog(true);
    };

    // Manejar cierre del diálogo
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedComportamiento(null);
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar o editar comportamiento
    const handleSave = async () => {
        try {
            const payload = { ...formValues, walletOtorgados: Number(formValues.walletOtorgados) };
            if (selectedComportamiento) {
                await updateComportamiento(selectedComportamiento.comportamientoId, payload);
            } else {
                await createComportamiento(payload);
            }
            setComportamientos(await getComportamientos({}));
            setSnackbar({ open: true, message: "Comportamiento guardado correctamente", severity: "success" });
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ open: true, message: "Error al guardar el comportamiento", severity: "error" });
            console.error("Error al guardar el comportamiento:", error);
        }
    };

    // Eliminar comportamiento
    const handleDelete = useCallback(async (id) => {
        try {
            await deleteComportamiento(id);
            setComportamientos((prev) => prev.filter((c) => c.comportamientoId !== id));
            setSnackbar({ open: true, message: "Comportamiento eliminado correctamente", severity: "success" });
        } catch (error) {
            setSnackbar({ open: true, message: "Error al eliminar el comportamiento", severity: "error" });
            console.error("Error al eliminar el comportamiento:", error);
        }
    }, []);

    // Columnas de la tabla
    const columns = [
        { field: "comportamientoId", headerName: "ID", width: 100 },
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
        { field: "walletOtorgados", headerName: "ULIs otorgados", width: 150 },
        {
            field: "organizacionId",
            headerName: "Organización",
            width: 200,
            renderCell: ({ value }) => organizaciones.find(o => o.organizacionId === value)?.nombre || value,
        },
        {
            field: "actions",
            headerName: "Acciones",
            type: "actions",
            width: 120,
            getActions: ({ row }) => [
                <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(row)} />,
                <GridActionsCellItem icon={<DeleteIcon />} label="Eliminar" onClick={() => handleDelete(row.comportamientoId)} />,
            ],
        },
    ];

    return (
        <Container>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <h1>Administrar Comportamientos</h1>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                    Añadir Comportamiento
                </Button>
            </Box>
            <DataGrid
                rows={comportamientos}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={row => row.comportamientoId}
                sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
                onRowClick={({ row }) => handleOpenDialog(row)}
            />
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedComportamiento ? "Editar Comportamiento" : "Añadir Comportamiento"}
                </DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Nombre" name="nombre" fullWidth value={formValues.nombre} onChange={handleChange} />
                    <TextField margin="dense" label="Descripción" name="descripcion" fullWidth value={formValues.descripcion} onChange={handleChange} />
                    <TextField margin="dense" label="ULIs otorgados" name="walletOtorgados" type="number" fullWidth value={formValues.walletOtorgados} onChange={handleChange} />
                    <TextField margin="dense" label="Organización" name="organizacionId" select fullWidth value={formValues.organizacionId} onChange={handleChange}>
                        {organizaciones.map(org => (
                            <MenuItem key={org.organizacionId} value={org.organizacionId}>{org.nombre}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CRUDComportamientos;
