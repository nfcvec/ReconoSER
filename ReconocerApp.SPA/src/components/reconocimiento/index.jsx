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
  const [institutionalValues, setInstitutionalValues] = useState([]); // Estado para valores institucionales
  const [selectedCollaborator, setSelectedCollaborator] = useState("");
  const [selectedValues, setSelectedValues] = useState([]);
  const [justification, setJustification] = useState("");
  const [certificateText, setCertificateText] = useState("");
  const [step, setStep] = useState("form"); // "form" | "confirm"
  const [totalUlis, setTotalUlis] = useState(0);

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

  // Cargar comportamientos desde la API
  useEffect(() => {
    const fetchComportamientos = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          console.error("No active account! Please log in.");
          return;
        }

        // Obtener el dominio del correo electrónico
        const email = account.username;
        const domain = email.split("@")[1]; // Extraer el dominio del correo
        console.log("Dominio del usuario:", domain);

        // Obtener comportamientos desde la API
        const comportamientos = await getComportamientos();
        console.log("Datos de comportamientos obtenidos:", comportamientos);

        // Verificar si los datos son válidos
        if (!Array.isArray(comportamientos)) {
          console.error("Los comportamientos no son un array válido.");
          return;
        }

        // Filtrar comportamientos según el dominio
        const filteredComportamientos = comportamientos.filter((comportamiento) => {
          console.log("Procesando comportamiento:", comportamiento);
          return (
            comportamiento.organizacion &&
            comportamiento.organizacion.dominioEmail &&
            comportamiento.organizacion.dominioEmail.includes(domain)
          );
        });

        console.log("Comportamientos filtrados:", filteredComportamientos);
        setInstitutionalValues(filteredComportamientos);
      } catch (error) {
        console.error("Error al obtener los comportamientos:", error.message);
      }
    };

    fetchComportamientos();
  }, [instance]);

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

        const colaboradores = await getColaboradores(response.accessToken);
        console.log("Colaboradores obtenidos:", colaboradores);
        setCollaborators(colaboradores); // Actualiza el estado con los colaboradores
      } catch (error) {
        console.error("Error al obtener los colaboradores:", error.message);
      }
    };

    fetchColaboradores();
  }, [instance]);

  // Actualizar el total de ULIs cuando cambien los valores seleccionados
  useEffect(() => {
    const total = selectedValues.reduce((sum, id) => {
      const value = institutionalValues.find((v) => v.comportamientoId === id);
      return sum + (value ? value.walletOtorgados : 0);
    }, 0);
    setTotalUlis(total);
  }, [selectedValues, institutionalValues]);

  const handleValueChange = (event, valueId) => {
    const checked = event.target.checked;

    if (checked && selectedValues.length >= 3) {
      // Si ya hay 3 seleccionados, no permitir más
      alert("Solo puedes seleccionar un máximo de 3 comportamientos.");
      return;
    }

    if (checked) {
      setSelectedValues([...selectedValues, valueId]);
    } else {
      setSelectedValues(selectedValues.filter((id) => id !== valueId));
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
    selectedCollaborator &&
    selectedValues.length > 0 &&
    justification.trim().length > 0 &&
    certificateText.trim().length > 0;

  return (
    <Container maxWidth="md" sx={{ py: 7 }}>
      {step === "form" ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            gap: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
            Dar Reconocimiento
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Reconoce a tus colaboradores por demostrar valores institucionales.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Card sx={{ maxWidth: "md", mx: "auto" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Reconoce a un Colaborador
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="collaborator-label">Seleccionar Colaborador</InputLabel>
                    <Select
                      labelId="collaborator-label"
                      id="collaborator"
                      value={selectedCollaborator}
                      label="Seleccionar Colaborador"
                      onChange={(e) => setSelectedCollaborator(e.target.value)}
                    >
                      {collaborators.map((collaborator) => (
                        <MenuItem key={collaborator.id} value={collaborator.id}>
                          {collaborator.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Comportamientos
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      {institutionalValues.length > 0 ? (
                        institutionalValues.map((value, index) => (
                          <Box
                            key={value.comportamientoId || index}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              py: 1,
                              borderBottom: index !== institutionalValues.length - 1 ? "1px solid #e0e0e0" : "none",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedValues.includes(value.comportamientoId)}
                                    onChange={(e) => handleValueChange(e, value.comportamientoId)}
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
                          Cargando valores institucionales...
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
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    id="certificate"
                    label="Texto del Certificado"
                    multiline
                    rows={3}
                    placeholder="Texto que aparecerá en el certificado..."
                    value={certificateText}
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
            selectedCollaborator,
            selectedValues,
            justification,
            certificateText,
            collaborators,
            institutionalValues,
          }}
          onConfirm={handleConfirm}
          onBack={handleBack}
        />
      )}
    </Container>
  );
}