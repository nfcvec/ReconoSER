import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Autocomplete,
} from "@mui/material";
import { getOrganizaciones } from "../../utils/services/organizaciones";
import { getComportamientos } from "../../utils/services/comportamientos";
import { getColaboradores } from "../../utils/services/colaboradores";
import { useMsal } from "@azure/msal-react";
import { graphUsersRequest } from "../../authConfig";
import ConfirmacionReconocimiento from "./ConfirmacionReconocimiento";

export default function Reconocimiento() {
  const navigate = useNavigate();
  const { instance } = useMsal(); // Asegúrate de que useMsal esté definido y configurado correctamente
  const [collaborators, setCollaborators] = useState([]); // Estado para colaboradores
  const [comportamientos, setComportamientos] = useState([]); // Estado para comportamientos
  const [Reconocido, setSelectedCollaborator] = useState(null);
  const [Comportamientos, setSelectedValues] = useState([]);
  const [Justificacion, setJustification] = useState("");
  const [Texto, setCertificateText] = useState("");
  const [step, setStep] = useState("form"); // "form" | "confirm"
  const [totalUlis, setTotalUlis] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [searchResults, setSearchResults] = useState([]); // Estado para los resultados de búsqueda

  const toggleSelection = (list, item, maxItems) => {
    if (list.some((i) => i.comportamientoId === item.comportamientoId)) {
      return list.filter((i) => i.comportamientoId !== item.comportamientoId);
    }
    if (list.length >= maxItems) {
      alert(`Solo puedes seleccionar un máximo de ${maxItems} comportamientos.`);
      return list;
    }
    return [...list, item];
  };

  // Cargar organizaiones desde la API
  useEffect(() => {
    // Llama a la API para obtener las organizaciones
    const fetchOrganizaciones = async () => {
      try {
        const organizaciones = await getOrganizaciones();
        console.log("Organizaciones:", organizaciones); // Muestra las organizaciones en la consola
      } catch (error) {
        console.error("Error al obtener las organizaciones:", error.message);
      }
    };

    fetchOrganizaciones();
  }, []);

  // Cargar colaboradores desde la API
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          console.error("No active account! Please log in.");
          return;
        }

        const response = await instance.acquireTokenSilent({
          scopes: graphUsersRequest.scopes,
          account: account,
        });

        let colaboradores = await getColaboradores(response.accessToken, searchTerm); // Llama a la API
        console.log("Colaboradores obtenidos:", colaboradores);

        // Obtener el correo del usuario que inició sesión
        const oid = account.idTokenClaims.oid;

        // Filtrar los colaboradores para excluir al usuario que inició sesión
        colaboradores = colaboradores.filter(
          (colaborador) => colaborador.id !== oid
        );

        setCollaborators(colaboradores); // Actualiza el estado con los colaboradores

      } catch (error) {
        console.error("Error al obtener los colaboradores:", error.message);
      }
    };

    fetchColaboradores();
  }, [instance, searchTerm]); // Agrega searchTerm como dependencia

  // Cargar comportamientos desde la API
  useEffect(() => {
    const fetchComportamientos = async () => {
      try {
        const comportamientos = await getComportamientos(); // Llama a la API
        console.log("Comportamientos obtenidos:", comportamientos);
        setComportamientos(comportamientos); // Actualiza el estado con los comportamientos
      } catch (error) {
        console.error("Error al obtener los comportamientos:", error.message);
      }
    };

    fetchComportamientos();
  }, []);

  // Actualizar el total de ULIs cuando cambien los valores seleccionados
  useEffect(() => {
    const total = Comportamientos.reduce((sum, item) => {
      return sum + (item ? item.walletOtorgados : 0);
    }, 0);
    setTotalUlis(total);
  }, [Comportamientos, comportamientos]);

  const handleValueChange = (event, value) => {
    const checked = event.target.checked;

    if (checked && Comportamientos.length >= 3) {
      // Si ya hay 3 seleccionados, no permitir más
      alert("Solo puedes seleccionar un máximo de 3 comportamientos.");
      return;
    }

    if (checked) {
      setSelectedValues(toggleSelection(Comportamientos, value, 3));
    } else {
      setSelectedValues(toggleSelection(Comportamientos, value, 3));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = () => {
    navigate("/reconocimientoExito"); // Cambia la ruta si es necesario
  };

  const handleBack = () => {
    setStep("form");
  };

  const isFormValid =
    Reconocido &&
    Comportamientos.length > 0 &&
    Justificacion.trim().length > 0 &&
    Texto.trim().length > 0;

  return (
    <>
      {step === "form" ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
            Dar Reconocimiento
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Reconoce a tus colaboradores por demostrar comportamientos.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Card sx={{ maxWidth: "md", mx: "auto" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Reconoce a un Colaborador
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
                  <Autocomplete
                    id="collaborator-autocomplete"
                    options={collaborators}
                    getOptionLabel={(option) => `${option.displayName} (${option.mail || option.userPrincipalName})`}
                    value={Reconocido}
                    onChange={(event, newValue) => {
                      setSelectedCollaborator(newValue);
                    }}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Seleccionar Colaborador"
                        placeholder="Busca un colaborador..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    )}
                  />
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Comportamientos
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      {comportamientos.length > 0 ? (
                        comportamientos.map((value, index) => (
                          <Box
                            key={value.comportamientoId || index}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              py: 1,
                              borderBottom: index !== comportamientos.length - 1 ? "1px solid #e0e0e0" : "none",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={Comportamientos.some((item) => item.comportamientoId === value.comportamientoId)}
                                    onChange={(e) => handleValueChange(e, value)}
                                  />
                                }
                                label={value.descripcion || "Sin descripción disponible"}
                              />
                            </Box>
                            <Box sx={{ textAlign: "right", mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {value.nombre}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Cargando comportamientos...
                        </Typography>
                      )}
                    </Paper>
                  </Box>

                  <TextField
                    id="justification"
                    label="Justificación"
                    multiline
                    rows={4}
                    placeholder="Explica cómo y por qué el colaborador ha destacado en estos valores..."
                    value={Justificacion}
                    onChange={(e) => setJustification(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    id="certificate"
                    label="Texto del Certificado"
                    multiline
                    rows={3}
                    placeholder="Texto que aparecerá en el certificado..."
                    value={Texto}
                    onChange={(e) => setCertificateText(e.target.value)}
                    fullWidth
                    helperText="Puedes editar el texto según sea necesario."
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 3, justifyContent: "space-between" }}>
                <Button variant="outlined" onClick={() => navigate("/")}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={!isFormValid}>
                  Continuar
                </Button>
              </CardActions>
            </Card>
          </form>
        </Box>
      ) : (
        
        <ConfirmacionReconocimiento
          data={{
            Reconocido,
            Comportamientos,
            Justificacion,
            Texto,
          }}
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
    </>
  );
}