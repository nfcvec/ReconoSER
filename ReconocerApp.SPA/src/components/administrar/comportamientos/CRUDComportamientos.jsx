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
    Paper,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useTheme } from "@mui/material/styles";
import {
    getComportamientos,
    createComportamiento,
    updateComportamiento,
    deleteComportamiento,
} from "../../../utils/services/comportamientos";
import { useOrganizacion } from "../../../contexts/OrganizacionContext";
import { useLoading } from "../../../contexts/LoadingContext";

const defaultForm = { nombre: "", descripcion: "", walletOtorgados: 0, organizacionId: 1, iconSvg: "" };

// Componente para previsualizar SVG
const SvgPreview = ({ svg, size = 48, emptyText = "Sin icono" }) => {
    const theme = useTheme();
    
    return svg ? (
        <Paper
            elevation={2}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                borderRadius: 1,
                backgroundColor: theme.palette.primary.main,
                overflow: 'hidden',
                '& svg': {
                    fill: 'white',
                    stroke: 'white'
                }
            }}
            title="SVG"
        >
            <span
                dangerouslySetInnerHTML={{ 
                    __html: svg.replace('<svg', `<svg width="${size - 8}" height="${size - 8}" style="display:block;margin:auto;"`) 
                }}
            />
        </Paper>
    ) : (
        <Paper
            elevation={1}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                borderRadius: 1,
                backgroundColor: '#f5f5f5',
                color: '#aaa'
            }}
        >
            <span>{emptyText}</span>
        </Paper>
    );
};

const CRUDComportamientos = () => {
    const [comportamientos, setComportamientos] = useState([]);
    const { organizacion } = useOrganizacion();
    const { showLoading, hideLoading } = useLoading();
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedComportamiento, setSelectedComportamiento] = useState(null);
    const [formValues, setFormValues] = useState(defaultForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Cargar comportamientos al montar el componente
    useEffect(() => {
        (async () => {
            showLoading("Cargando comportamientos...");
            try {
                const comps = await getComportamientos({ 
                    filters: [{ field: "OrganizacionId", operator: "eq", value: `${organizacion.organizacionId}` }],
                });
                setComportamientos(comps);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            } finally {
                hideLoading();
            }
        })();
    }, [organizacion.organizacionId, showLoading, hideLoading]);

    // Manejar apertura del diálogo
    const handleOpenDialog = (comportamiento = null) => {
        setSelectedComportamiento(comportamiento);
        if (comportamiento) {
            setFormValues(comportamiento);
        } else {
            setFormValues({ ...defaultForm, organizacionId: organizacion.organizacionId });
        }
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

    // Manejar carga de archivo SVG
    const handleSvgUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setFormValues((prev) => ({ ...prev, iconSvg: ev.target.result }));
            };
            reader.readAsText(file);
        } else {
            setSnackbar({ open: true, message: "Solo se permiten archivos SVG.", severity: "warning" });
        }
    };

    // Guardar o editar comportamiento
    const handleSave = async () => {
        showLoading("Guardando comportamiento...");
        try {
            const payload = { ...formValues, walletOtorgados: Number(formValues.walletOtorgados), organizacionId: organizacion.organizacionId };
            if (selectedComportamiento) {
                // Asegurarse de enviar el id correcto
                await updateComportamiento(selectedComportamiento.comportamientoId, payload);
            } else {
                await createComportamiento(payload);
            }
            setComportamientos(await getComportamientos({ filters: [{ field: "OrganizacionId", operator: "eq", value: `${organizacion.organizacionId}` }] }));
            setSnackbar({ open: true, message: "Comportamiento guardado correctamente", severity: "success" });
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ open: true, message: "Error al guardar el comportamiento", severity: "error" });
            console.error("Error al guardar el comportamiento:", error);
        } finally {
            hideLoading();
        }
    };

    // Eliminar comportamiento
    const handleDelete = useCallback(async (id) => {
        showLoading("Eliminando comportamiento...");
        try {
            await deleteComportamiento(id);
            setComportamientos((prev) => prev.filter((c) => c.comportamientoId !== id));
            setSnackbar({ open: true, message: "Comportamiento eliminado correctamente", severity: "success" });
        } catch (error) {
            setSnackbar({ open: true, message: "Error al eliminar el comportamiento", severity: "error" });
            console.error("Error al eliminar el comportamiento:", error);
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading]);

    // Columnas de la tabla
    const columns = [
        { field: "comportamientoId", headerName: "ID", width: 100 },
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
        { field: "walletOtorgados", headerName: "ULIs otorgados", width: 150 },
        { field: "iconSvg", headerName: "Icono SVG", width: 90, renderCell: ({ value }) => <SvgPreview svg={value} /> },
        {
            field: "organizacionId",
            headerName: "Organización",
            width: 200,
            renderCell: () => organizacion.nombre,
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
                <Typography variant="h4" color="white">Administrar Comportamientos</Typography>
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
                    {[{ label: "Nombre", name: "nombre" }, { label: "Descripción", name: "descripcion" }, { label: "ULIs otorgados", name: "walletOtorgados", type: "number" }].map(({ label, name, type }) => (
                        <TextField key={name} margin="dense" label={label} name={name} fullWidth value={formValues[name]} onChange={handleChange} type={type || 'text'} />
                    ))}
                    {/* Mostrar la organización como texto, no como select */}
                    <TextField margin="dense" label="Organización" name="organizacionId" fullWidth value={organizacion.nombre} InputProps={{ readOnly: true }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <input
                            accept=".svg"
                            style={{ display: 'none' }}
                            id="icon-svg-upload"
                            type="file"
                            onChange={handleSvgUpload}
                        />
                        <label htmlFor="icon-svg-upload">
                            <Button variant="outlined" component="span" startIcon={<UploadFileIcon />}>Seleccionar SVG</Button>
                        </label>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <SvgPreview svg={formValues.iconSvg} size={100} emptyText="" />
                          {formValues.iconSvg && (
                            <Button
                              size="small"
                              sx={{ position: 'absolute', top: 0, right: 0, minWidth: 0, padding: '4px', background: 'rgba(255,255,255,0.7)' }}
                              onClick={() => setFormValues(prev => ({ ...prev, iconSvg: '' }))}
                            >
                              <DeleteIcon fontSize="small" color="error" />
                            </Button>
                          )}
                        </Box>
                    </Box>
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
