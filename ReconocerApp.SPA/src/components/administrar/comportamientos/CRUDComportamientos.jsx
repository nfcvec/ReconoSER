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
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
    getComportamientos,
    createComportamiento,
    updateComportamiento,
    deleteComportamiento,
} from "../../../utils/services/comportamientos";
import { getOrganizaciones } from "../../../utils/services/organizaciones";

const defaultForm = { nombre: "", descripcion: "", walletOtorgados: 0, organizacionId: 1, iconSvg: "" };

// Componente para previsualizar SVG
const SvgPreview = ({ svg, size = 48, emptyText = "Sin icono" }) => svg ? (
    <span
        title="SVG"
        style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: size, height: size, background: '#f5f5f5', borderRadius: 4, border: '1px solid #eee', overflow: 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: svg.replace('<svg', `<svg width=\"${size - 8}\" height=\"${size - 8}\" style=\"display:block;margin:auto;\"`) }}
    />
) : <span style={{ color: '#aaa' }}>{emptyText}</span>;

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
        try {
            const payload = { ...formValues, walletOtorgados: Number(formValues.walletOtorgados) };
            if (selectedComportamiento) {
                // Asegurarse de enviar el id correcto
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
        { field: "iconSvg", headerName: "Icono SVG", width: 90, renderCell: ({ value }) => <SvgPreview svg={value} /> },
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
                    {[{ label: "Nombre", name: "nombre" }, { label: "Descripción", name: "descripcion" }, { label: "ULIs otorgados", name: "walletOtorgados", type: "number" }].map(({ label, name, type }) => (
                        <TextField key={name} margin="dense" label={label} name={name} fullWidth value={formValues[name]} onChange={handleChange} type={type || 'text'} />
                    ))}
                    <TextField margin="dense" label="Organización" name="organizacionId" select fullWidth value={formValues.organizacionId} onChange={handleChange}>
                        {organizaciones.map(org => (
                            <MenuItem key={org.organizacionId} value={org.organizacionId}>{org.nombre}</MenuItem>
                        ))}
                    </TextField>
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
