import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { getCategorias } from "../../../utils/services/categorias";
import { useAlert } from "../../../contexts/AlertContext";

const SelectorCategorias = ({ onSelect }) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const showAlert = useAlert(); // Usar el contexto de alertas

    // Función para cargar las categorías desde la API
    const fetchCategorias = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch (error) {
            console.error("Error al cargar las categorías:", error);
            showAlert("Error al cargar las categorías.", "error");
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    // Cargar las categorías al montar el componente
    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    // Columnas de la tabla
    const columns = [
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
    ];

    return (
        <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={categorias}
                columns={columns}
                loading={loading}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.categoriaId} // Especifica que `categoriaId` es el identificador único
                onRowClick={(params) => onSelect(params.row)} // Llama a la función `onSelect` al hacer clic en una fila
            />
        </Box>
    );
};

export default SelectorCategorias;