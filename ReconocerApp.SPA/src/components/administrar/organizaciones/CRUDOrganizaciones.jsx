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
    getOrganizaciones,
    createOrganizacion,
    updateOrganizacion,
    deleteOrganizacion,
} from "../../../utils/services/organizaciones";

const defaultForm = { nombre: "", descripcion: "", dominioEmail: "", colorPrincipal: "#1976d2", activa: true, iconSvg: "" };

const CRUDOrganizaciones = () => {
    const [organizaciones, setOrganizaciones] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrganizacion, setSelectedOrganizacion] = useState(null);
    const [formValues, setFormValues] = useState(defaultForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        (async () => {
            try {
                setOrganizaciones(await getOrganizaciones());
            } catch (error) {
                setSnackbar({ open: true, message: "Error al cargar organizaciones", severity: "error" });
            }
        })();
    }, []);

    const handleOpenDialog = (organizacion = null) => {
        setSelectedOrganizacion(organizacion);
        setFormValues(organizacion || defaultForm);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrganizacion(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };
    const handleColorChange = (color) => {
        setFormValues((prev) => ({ ...prev, colorPrincipal: color }));
    };

    const handleSave = async () => {
        try {
            if (selectedOrganizacion) {
                await updateOrganizacion(selectedOrganizacion.organizacionId, formValues);
            } else {
                await createOrganizacion(formValues);
            }
            setOrganizaciones(await getOrganizaciones());
            setSnackbar({ open: true, message: "Organización guardada correctamente", severity: "success" });
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ open: true, message: "Error al guardar la organización", severity: "error" });
        }
    };

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteOrganizacion(id);
            setOrganizaciones((prev) => prev.filter((o) => o.organizacionId !== id));
            setSnackbar({ open: true, message: "Organización eliminada correctamente", severity: "success" });
        } catch (error) {
            setSnackbar({ open: true, message: "Error al eliminar la organización", severity: "error" });
        }
    }, []);

    const columns = [
        { field: "organizacionId", headerName: "ID", width: 100 },
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
        {
            field: "actions",
            headerName: "Acciones",
            type: "actions",
            width: 120,
            getActions: ({ row }) => [
                <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={() => handleOpenDialog(row)} />,
                <GridActionsCellItem icon={<DeleteIcon />} label="Eliminar" onClick={() => handleDelete(row.organizacionId)} />,
            ],
        },
    ];

    return (
        <Container>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <h1>Administrar Organizaciones</h1>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                    Añadir Organización
                </Button>
            </Box>
            <DataGrid
                rows={organizaciones}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={row => row.organizacionId}
                sx={{ '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' } }}
                onRowClick={({ row }) => handleOpenDialog(row)}
            />
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{selectedOrganizacion ? "Editar Organización" : "Añadir Organización"}</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Nombre" name="nombre" fullWidth value={formValues.nombre} onChange={handleChange} />
                    <TextField margin="dense" label="Descripción" name="descripcion" fullWidth value={formValues.descripcion} onChange={handleChange} />
                    <TextField margin="dense" label="Dominio Email" name="dominioEmail" fullWidth value={formValues.dominioEmail} onChange={handleChange} />
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Color principal</label>
                        <input type="color" value={formValues.colorPrincipal} onChange={e => handleColorChange(e.target.value)} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer' }} />
                    </Box>
                    {/* Seleccionar Icono SVG */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <input
                            accept=".svg"
                            style={{ display: 'none' }}
                            id="icon-svg-upload-org"
                            type="file"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file && file.type === "image/svg+xml") {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        setFormValues(prev => ({ ...prev, iconSvg: ev.target.result }));
                                    };
                                    reader.readAsText(file);
                                } else {
                                    setSnackbar({ open: true, message: "Solo se permiten archivos SVG.", severity: "warning" });
                                }
                            }}
                        />
                        <label htmlFor="icon-svg-upload-org">
                            <Button variant="outlined" component="span" startIcon={<EditIcon />}>Seleccionar Icono</Button>
                        </label>
                        {/* Vista previa SVG */}
                        {formValues.iconSvg ? (
                            <span
                                title="SVG"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: '#f5f5f5', borderRadius: 4, border: '1px solid #eee', overflow: 'hidden' }}
                                dangerouslySetInnerHTML={{ __html: formValues.iconSvg.replace('<svg', '<svg width="40" height="40" style="display:block;margin:auto;"') }}
                            />
                        ) : (
                            <span style={{ color: '#aaa' }}>Sin icono</span>
                        )}
                    </Box>
                    <TextField
                        margin="dense"
                        label="Estado"
                        name="activa"
                        select
                        fullWidth
                        value={formValues.activa}
                        onChange={handleChange}
                    >
                        <MenuItem value={true}>Activo</MenuItem>
                        <MenuItem value={false}>Desactivado</MenuItem>
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

export default CRUDOrganizaciones;
