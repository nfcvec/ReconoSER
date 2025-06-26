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
    Typography,
    Paper,
    useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    getOrganizaciones,
    createOrganizacion,
    updateOrganizacion,
    deleteOrganizacion,
} from "../../../utils/services/organizaciones";
import { useLoading } from "../../../contexts/LoadingContext";

const defaultForm = { nombre: "", descripcion: "", dominioEmail: "", colorPrincipal: "#1976d2", activa: true, iconSvg: "" };

const SvgPreview = ({ svg, emptyText = "Sin icono" }) => {
    const theme = useTheme();
    
    return svg ? (
        <Paper
            elevation={2}
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: 200,
                height: 'auto',
                minHeight: 100,
                justifyContent: 'center',
                borderRadius: 1,
                backgroundColor: theme.palette.primary.main,
                overflow: 'hidden',
                padding: 1,
                '& svg': {
                    fill: 'white',
                    stroke: 'white',
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%'
                }
            }}
            title="SVG"
        >
            <span
                dangerouslySetInnerHTML={{ 
                    __html: svg.replace('<svg', `<svg style="display:block;margin:auto;width:100%;height:auto;"`) 
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
                width: 200,
                height: 100,
                borderRadius: 1,
                backgroundColor: '#f5f5f5',
                color: '#aaa'
            }}
        >
            <span>{emptyText}</span>
        </Paper>
    );
};

const CRUDOrganizaciones = () => {
    const [organizaciones, setOrganizaciones] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrganizacion, setSelectedOrganizacion] = useState(null);
    const [formValues, setFormValues] = useState(defaultForm);
    const { showLoading, hideLoading } = useLoading();
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        (async () => {
            showLoading("Cargando organizaciones...");
            try {
                setOrganizaciones(await getOrganizaciones());
            } catch (error) {
                setSnackbar({ open: true, message: "Error al cargar organizaciones", severity: "error" });
            } finally {
                hideLoading();
            }
        })();
    }, [showLoading, hideLoading]);

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
        showLoading("Guardando organización...");
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
        } finally {
            hideLoading();
        }
    };

    const handleDelete = useCallback(async (id) => {
        showLoading("Eliminando organización...");
        try {
            await deleteOrganizacion(id);
            setOrganizaciones((prev) => prev.filter((o) => o.organizacionId !== id));
            setSnackbar({ open: true, message: "Organización eliminada correctamente", severity: "success" });
        } catch (error) {
            setSnackbar({ open: true, message: "Error al eliminar la organización", severity: "error" });
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading]);

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
                <Typography variant="h4" color="white">Administrar Organizaciones</Typography>
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
                    <Box sx={{ mb: 2 }}>
                        {/* Vista previa SVG - arriba */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <SvgPreview svg={formValues.iconSvg} />
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
                        {/* Acciones - abajo */}
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                        </Box>
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
