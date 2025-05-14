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
import DeleteIcon from "@mui/icons-material/Delete";
import {
    getCategorias,
    editCategoria,
    deleteCategoria,
    createCategoria,
} from "../../../utils/services/categorias";

const CRUDCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [formValues, setFormValues] = useState({
        nombre: "",
        descripcion: "",
    });

    // Cargar categorías al montar el componente
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                setCategorias(data);
            } catch (error) {
                console.error("Error al cargar las categorías:", error);
            }
        };
        fetchCategorias();
    }, []);

    // Manejar apertura del diálogo
    const handleOpenDialog = (categoria = null) => {
        setSelectedCategoria(categoria);
        setFormValues(
            categoria || {
                nombre: "",
                descripcion: "",
            }
        );
        setOpenDialog(true);
    };

    // Manejar cierre del diálogo
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCategoria(null);
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar o editar categoría
    const handleSave = async () => {
        try {
            const payload = { ...formValues };
            if (selectedCategoria) {
                // Editar categoría
                await editCategoria(selectedCategoria.categoriaId, payload);
            } else {
                // Crear nueva categoría
                await createCategoria(payload);
            }
            const data = await getCategorias();
            setCategorias(data);
            handleCloseDialog();
        } catch (error) {
            console.error("Error al guardar la categoría:", error);
        }
    };

    // Eliminar categoría
    const handleDelete = useCallback(
        async (id) => {
            try {
                await deleteCategoria(id);
                setCategorias((prev) => prev.filter((categoria) => categoria.categoriaId !== id));
            } catch (error) {
                console.error("Error al eliminar la categoría:", error);
            }
        },
        []
    );

    // Columnas de la tabla
    const columns = [
        { field: "categoriaId", headerName: "ID", width: 100 },
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
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
                <h1>Administrar Categorías</h1>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                    Añadir Categoría
                </Button>
            </Box>
            <DataGrid
                rows={categorias}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.categoriaId} // Especifica que `categoriaId` es el identificador único
                sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold',
                    },
                  }}
            />
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedCategoria ? "Editar Categoría" : "Añadir Categoría"}
                </DialogTitle>
                <DialogContent>
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

export default CRUDCategorias;