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
    fetchRecognitions,
    updateRecognition,
    deleteRecognition,
    createRecognition,
} from "../../../utils/services/reconocer.js"; // Asegúrate que este archivo exista y tenga los nombres correctos

const CRUDRecognitions = () => {
    const [recognitions, setRecognitions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRecognition, setSelectedRecognition] = useState(null);
    const [formValues, setFormValues] = useState({
        estado: "",
        comentarioRevision: "",
        fechaResolucion: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchRecognitions();
                setRecognitions(data);
            } catch (error) {
                console.error("Error fetching recognitions:", error);
            }
        };
        fetchData();
    }, []);

    const handleOpenDialog = (recognition = null) => {
        setSelectedRecognition(recognition);
        setFormValues(
            recognition || {
                estado: "",
                comentarioRevision: "",
                fechaResolucion: "",
            }
        );
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRecognition(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            if (selectedRecognition) {
                await updateRecognition(selectedRecognition.reconocimientoId, formValues);
            } else {
                await createRecognition(formValues);
            }
            const data = await fetchRecognitions();
            setRecognitions(data);
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving recognition:", error);
        }
    };

    const handleDelete = useCallback(
        async (id) => {
            try {
                await deleteRecognition(id);
                setRecognitions((prev) => prev.filter((r) => r.reconocimientoId !== id));
            } catch (error) {
                console.error("Error deleting recognition:", error);
            }
        },
        []
    );

    const columns = [
        { field: "reconocimientoId", headerName: "ID", width: 80 },
        { field: "tokenColaborador", headerName: "Token Colaborador", width: 200 },
        { field: "justificacion", headerName: "Justificación", width: 250 },
        { field: "texto", headerName: "Texto", width: 250 },
        { field: "titulo", headerName: "Título", width: 200 },
        { field: "fechaCreacion", headerName: "Fecha Creación", width: 180 },
        { field: "estado", headerName: "Estado", width: 120 },
        { field: "comentarioRevision", headerName: "Comentario Revisión", width: 250 },
        { field: "fechaResolucion", headerName: "Fecha Resolución", width: 180 },
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
                <h1>Manage Recognitions</h1>
                <Button variant="contained" onClick={() => handleOpenDialog()}>
                    Add Recognition
                </Button>
            </Box>
            <DataGrid
                rows={recognitions}
                columns={columns}
                autoHeight
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.reconocimientoId}
            />
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedRecognition ? "Edit Recognition" : "Add Recognition"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Estado"
                        name="estado"
                        fullWidth
                        value={formValues.estado}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Comentario Revisión"
                        name="comentarioRevision"
                        fullWidth
                        value={formValues.comentarioRevision}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Fecha Resolución"
                        name="fechaResolucion"
                        fullWidth
                        value={formValues.fechaResolucion}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CRUDRecognitions;
