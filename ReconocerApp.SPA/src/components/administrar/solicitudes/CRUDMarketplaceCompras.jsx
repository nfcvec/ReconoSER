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
        console.log("Datos obtenidos de getPremiosCompras:", data);
        console.log("Valor de organizacionId:", organizacionId);

        const filtered = data.filter((item) => item.organizacionId === organizacionId);
        if (filtered.length === 0) {
            console.warn("No se encontraron compras para la organización:", organizacionId);
        }
        console.log("Datos de compras filtrados:", filtered);
        setCompras(filtered);

        try {
            console.log("Intentando obtener el token de acceso...");
            const response = await instance.acquireTokenSilent({
                account: accounts[0],
                scopes: ["User.Read.All"], // Asegúrate de que este permiso esté configurado en Azure AD
            });
            console.log("Token de acceso obtenido:", response.accessToken);

            const colaboradoresData = await getColaboradores(response.accessToken);
            console.log("Datos obtenidos de getColaboradores:", colaboradoresData);

            const colaboradoresMap = {};
            colaboradoresData.forEach((colaborador) => {
                colaboradoresMap[colaborador.id] = colaborador.displayName;
            });
            setColaboradores(colaboradoresMap);
        } catch (error) {
            if (error.name === "InteractionRequiredAuthError") {
                console.warn("El token ha expirado. Intentando obtener un nuevo token...");
                try {
                    const response = await instance.acquireTokenPopup({
                        scopes: ["User.Read.All"],
                    });
                    const colaboradoresData = await getColaboradores(response.accessToken);
                    console.log("Datos obtenidos de getColaboradores:", colaboradoresData);

                    const colaboradoresMap = {};
                    colaboradoresData.forEach((colaborador) => {
                        colaboradoresMap[colaborador.id] = colaborador.displayName;
                    });
                    setColaboradores(colaboradoresMap);
                } catch (popupError) {
                    console.error("Error al obtener el token mediante popup:", popupError);
                }
            } else {
                console.error("Error al obtener el token:", error);
            }
        }

        try {
            const premiosData = await getPremios();
            const premiosMap = {};
            premiosData.forEach((premio) => {
                premiosMap[premio.premioId] = premio.nombre;
            });
            setPremios(premiosMap);
        } catch (error) {
            if (error.response?.status === 401) {
                console.error("No autorizado al obtener premios. Verifica el token.");
            } else {
                console.error("Error al obtener premios:", error);
            }
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}, [organizacionId, instance, accounts]);

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
