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
  getReconocimientos,
  editReconocimiento,
  deleteReconocimiento,
  createReconocimiento,
} from "../../../utils/services/reconocimientos";
import { getColaboradores } from "../../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";

const CRUDReconocimientos = () => {
  const [reconocimientos, setReconocimientos] = useState([]);
  const [colaboradores, setColaboradores] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formValues, setFormValues] = useState({
    tokenColaborador: "",
    justificacion: "",
    texto: "",
    titulo: "",
    fechaCreacion: new Date().toISOString(),
    estado: "pendiente",
    comentarioRevision: "",
    fechaResolucion: "",
  });

  const { instance, accounts } = useMsal();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReconocimientos();
        setReconocimientos(data);
      } catch (error) {
        console.error("Error al cargar los reconocimientos:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const response = await instance.acquireTokenSilent({
          account: accounts[0],
          scopes: ["User.Read.All"],
        });

        const users = await getColaboradores(response.accessToken);
        const colaboradorMap = {};
        users.forEach(user => {
          colaboradorMap[user.id] = user.displayName;
        });
        setColaboradores(colaboradorMap);
      } catch (error) {
        console.error("Error al obtener colaboradores:", error);
      }
    };
    fetchColaboradores();
  }, [instance, accounts]);

  const handleOpenDialog = (item = null) => {
    setSelected(item);
    setFormValues(
      item || {
        tokenColaborador: "",
        justificacion: "",
        texto: "",
        titulo: "",
        fechaCreacion: new Date().toISOString(),
        estado: "pendiente",
        comentarioRevision: "",
        fechaResolucion: "",
      }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelected(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (selected) {
        await editReconocimiento(selected.reconocimientoId, formValues);
      } else {
        await createReconocimiento(formValues);
      }
      const updated = await getReconocimientos();
      setReconocimientos(updated);
      handleCloseDialog();
    } catch (error) {
      console.error("Error al guardar el reconocimiento:", error);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteReconocimiento(id);
        setReconocimientos((prev) => prev.filter((r) => r.reconocimientoId !== id));
      } catch (error) {
        console.error("Error al eliminar el reconocimiento:", error);
      }
    },
    []
  );

  const columns = [
    {
      field: "tokenColaborador",
      headerName: "Colaborador",
      width: 250,
      renderCell: (params) => colaboradores[params.value] || params.value,
    },
    { field: "justificacion", headerName: "Justificación", width: 250 },
    { field: "texto", headerName: "Texto", width: 250 },
    { field: "titulo", headerName: "Título", width: 250 },
    { field: "fechaCreacion", headerName: "Fecha Creación", width: 200 },
    { field: "estado", headerName: "Estado", width: 150 },
    { field: "comentarioRevision", headerName: "Comentario Revisión", width: 250 },
    { field: "fechaResolucion", headerName: "Fecha Resolución", width: 200 },
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
        <h1>Administrar Reconocimientos</h1>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Añadir Reconocimiento
        </Button>
      </Box>
      <DataGrid
        rows={reconocimientos}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.reconocimientoId}
        autoHeight
      />
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selected ? "Editar" : "Añadir"} Reconocimiento</DialogTitle>
        <DialogContent>
          {[
            "tokenColaborador",
            "justificacion",
            "texto",
            "titulo",
            "fechaCreacion",
            "estado",
            "comentarioRevision",
            "fechaResolucion",
          ].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              fullWidth
              value={formValues[field]}
              onChange={handleChange}
            />
          ))}
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

export default CRUDReconocimientos;
