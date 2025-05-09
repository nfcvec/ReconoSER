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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getPremiosCompras,
  createPremioCompra,
  editPremioCompra,
  deletePremioCompra,
} from "../../../utils/services/premiosCompra";
import { getColaboradores } from "../../../utils/services/colaboradores";
import { getPremios } from "../../../utils/services/premios";
import { useMsal } from "@azure/msal-react";
import { getOrganizaciones } from "../../../utils/services/organizaciones";

const CRUDMarketplaceCompras = () => {
  const [compras, setCompras] = useState([]);
  const [colaboradores, setColaboradores] = useState({});
  const [premios, setPremios] = useState({});
  const [organizacionId, setOrganizacionId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formValues, setFormValues] = useState({
    compraId: "",
    tokenColaborador: "",
    premioId: "",
    estado: "pendiente",
    comentarioRevision: "",
    fechaResolucion: new Date().toLocaleDateString("es-EC"),
  });

  const { instance, accounts } = useMsal();

  useEffect(() => {
    const fetchOrganizacionId = async () => {
      const email = accounts[0]?.username || "";
      const domain = email.split("@")[1];
      try {
        const organizaciones = await getOrganizaciones();
        const org = organizaciones.find(
          (o) => o?.dominioEmail?.toLowerCase() === domain.toLowerCase()
        );
        if (org) {
          setOrganizacionId(org.organizacionId);
        }
      } catch (error) {
        console.error("Error al obtener organizaciones:", error);
      }
    };

    fetchOrganizacionId();
  }, [accounts]);

  const fetchData = useCallback(async () => {
    try {
      const data = await getPremiosCompras();
      const filtered = data.filter((item) => item.organizacionId === organizacionId);
      setCompras(filtered);

      console.log("Datos de compras filtrados:", filtered); // Corregido

      const colaboradoresData = await getColaboradores();
      const colaboradoresMap = {};
      colaboradoresData.forEach((colaborador) => {
        colaboradoresMap[colaborador.id] = colaborador.displayName;
      });
      setColaboradores(colaboradoresMap);

      const premiosData = await getPremios();
      const premiosMap = {};
      premiosData.forEach((premio) => {
        premiosMap[premio.premioId] = premio.nombre;
      });
      setPremios(premiosMap);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }, [organizacionId]);

  useEffect(() => {
    if (organizacionId) {
      fetchData();
    }
  }, [organizacionId, fetchData]);

  const handleOpenDialog = (item = null) => {
    setSelected(item);
    setFormValues(
      item || {
        compraId: "",
        estado: "pendiente",
        comentarioRevision: "",
        fechaResolucion: new Date().toLocaleDateString("es-EC"),
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
      const payload = {
        compraId: formValues.compraId,
        estado: formValues.estado,
        comentarioRevision: formValues.comentarioRevision,
        fechaResolucion: formValues.fechaResolucion,
      };

      if (selected) {
        await editPremioCompra(payload.compraId, payload);
      } else {
        await createPremioCompra(payload);
      }

      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error("Error al guardar compra:", error);
    }
  };

  const columns = [
    {
      field: "tokenColaborador",
      headerName: "Colaborador",
      width: 250,
      renderCell: (params) => colaboradores[params.value] || params.value,
    },
    {
      field: "premioId",
      headerName: "Premio",
      width: 250,
      renderCell: (params) => premios[params.value] || params.value,
    },
    { field: "fechaCompra", headerName: "Fecha de Compra", width: 200 },
    { field: "estado", headerName: "Estado", width: 150 },
    { field: "comentarioRevision", headerName: "Comentario", width: 250 },
    { field: "fechaResolucion", headerName: "Fecha de Resolución", width: 200 },
  ];

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <h1>Administrar Compras del Marketplace</h1>
      </Box>
      <DataGrid
        rows={compras}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.compraId}
        autoHeight
      />
    </Container>
  );
};

export default CRUDMarketplaceCompras;
