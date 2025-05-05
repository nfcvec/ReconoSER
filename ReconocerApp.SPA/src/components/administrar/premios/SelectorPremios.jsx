import React, { useState, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import { getPremios } from "../../../utils/services/premios";
import { useAlert } from "../../../contexts/AlertContext";

const SelectorPremios = ({ organizacionId, onSelect, multiple = false }) => {
    const [premios, setPremios] = useState([]);
    const [selectedPremios, setSelectedPremios] = useState([]);
    const [loading, setLoading] = useState(false);
    const showAlert = useAlert();

    const fetchPremios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPremios();
            const filtered = data.filter((p) => p.organizacionId === organizacionId);
            setPremios(filtered);
        } catch (error) {
            console.error("Error al cargar los premios:", error);
            showAlert("Error al cargar los premios.", "error");
        } finally {
            setLoading(false);
        }
    }, [organizacionId, showAlert]);

    useEffect(() => {
        if (organizacionId) {
            fetchPremios();
        }
    }, [organizacionId, fetchPremios]);

    const handleSelectionChange = (selection) => {
        const selected = premios.filter((premio) => selection.includes(premio.premioId));
        setSelectedPremios(selected);
    };

    const handleConfirmSelection = () => {
        onSelect(multiple ? selectedPremios : selectedPremios[0]);
    };

    const columns = [
        { field: "nombre", headerName: "Nombre", width: 200 },
        { field: "descripcion", headerName: "Descripción", width: 300 },
        { field: "costoWallet", headerName: "Costo Wallet", width: 150 },
        { field: "cantidadActual", headerName: "Cantidad Actual", width: 150 },
        {
            field: "categoriaNombre",
            headerName: "Categoría",
            width: 200,
            renderCell: (params) => {
                return params.row?.categoria?.nombre || "No asignada";
            }
        },
    ];

    return (
        <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
                rows={premios}
                columns={columns}
                loading={loading}
                pageSize={5}
                rowsPerPageOptions={[5]}
                getRowId={(row) => row.premioId}
                checkboxSelection={multiple}
                onSelectionModelChange={(selection) => handleSelectionChange(selection)}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleConfirmSelection}
                    disabled={selectedPremios.length === 0}
                >
                    Confirmar Selección
                </Button>
            </Box>
        </Box>
    );
};

export default SelectorPremios;
