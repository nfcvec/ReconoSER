import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Autocomplete,
} from "@mui/material";
  import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { getUserOrganizacion } from "../../utils/services/organizaciones";
import { getComportamientos } from "../../utils/services/comportamientos";
import { getColaboradores } from "../../utils/services/colaboradores";
import ConfirmacionReconocimiento from "./ConfirmacionReconocimiento";
import { useOrganizacion } from "../../contexts/OrganizacionContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { useMsal } from "@azure/msal-react";

export default function Reconocimiento() {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]); // Estado para colaboradores
  const [comportamientos, setComportamientos] = useState([]); // Estado para comportamientos
  const [Reconocido, setSelectedCollaborator] = useState(null);
  const [Comportamientos, setSelectedValues] = useState([]);
  const [Justificacion, setJustification] = useState("");
  const [Texto, setCertificateText] = useState("");
  const [step, setStep] = useState("form"); // "form" | "confirm"
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { organizacion } = useOrganizacion();
  const {instance} = useMsal();
  const showAlert = useAlert();
  const { showLoading, hideLoading } = useLoading();

  // Cargar colaboradores desde la API
  useEffect(() => {
    const fetchColaboradores = async () => {
      try {

        let colaboradores = await getColaboradores(searchTerm); // Llama a la API
        console.log("Colaboradores obtenidos:", colaboradores);

        // Obtener el correo del usuario que inició sesión
        const oid = instance.getActiveAccount().idTokenClaims.oid;

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
  }, [searchTerm]); // Agrega searchTerm como dependencia

  // Cargar comportamientos desde la API
  useEffect(() => {
    if (!Reconocido || !Reconocido.id) return;
    const fetchComportamientosConOrganizacion = async () => {
      showLoading("Cargando comportamientos...");
      setComportamientos([]); // Limpiar comportamientos antes de la consulta
      try {
        const organizacionColaborador = await getUserOrganizacion(Reconocido.id);

        if (!organizacionColaborador?.organizacionId) {
          showAlert('La organización del colaborador aún no está implementada. Selecciona otro colaborador.', 'warning');
          setSelectedCollaborator(null);
          hideLoading();
          return;
        }

        const comportamientos = await getComportamientos({
          page: 1,
          pageSize: 100,
          filters: [
            {
              field: "OrganizacionId",
              operator: "eq",
              value: `${organizacionColaborador.organizacionId}`
            }
          ]
        });
        console.log("Comportamientos obtenidos:", comportamientos);
        setComportamientos(comportamientos);
        hideLoading();
      } catch (error) {
        showAlert('La organización del colaborador aún no está implementada. Selecciona otro colaborador.', 'error');
        setSelectedCollaborator(null);
        console.error('Error al obtener la organización o comportamientos:', error);
        hideLoading();
      }
    };

    fetchComportamientosConOrganizacion();
  }, [Reconocido]);

  const handleValueChange = (event, value) => {
    const checked = event.target.checked;

    if (checked) {
      // Verificar si ya se alcanzó el límite de 3 comportamientos
      if (Comportamientos.length >= 3) {
        setSnackbarOpen(true);
        return;
      }

      // Filtrar comportamientos para asegurarnos de que no haya duplicados por nombre
      const filteredComportamientos = Comportamientos.filter(
        (item) => item.nombre !== value.nombre
      );

      setSelectedValues([...filteredComportamientos, value]);
    } else {
      // Si se desmarca, eliminar el comportamiento de la lista
      setSelectedValues(
        Comportamientos.filter(
          (item) => item.comportamientoId !== value.comportamientoId
        )
      );
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
          <Typography variant="h4" component="h1" color="white" gutterBottom sx={{ fontWeight: "bold" }}>
            Dar Reconocimiento
          </Typography>
          <Typography variant="body1" color="white" sx={{ mb: 4 }}>
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
                        label="Seleccionar Colaborador (Correo)"
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
                        comportamientos.map((value, index) => {
                          const isSelected = Comportamientos.some((item) => item.comportamientoId === value.comportamientoId);
                          return (
                            <Box
                              key={value.comportamientoId || index}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                py: 1,
                                borderBottom: index !== comportamientos.length - 1 ? "1px solid #e0e0e0" : "none",
                                backgroundColor: isSelected ? "#e3f2fd" : "inherit",
                                borderRadius: 2,
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onClick={() => {
                                // Simula el click del checkbox
                                const fakeEvent = { target: { checked: !isSelected } };
                                handleValueChange(fakeEvent, value);
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={(e) => handleValueChange(e, value)}
                                      onClick={(e) => e.stopPropagation()} // Evita doble toggle al hacer click en el checkbox
                                    />
                                  }
                                  label={value.descripcion || "Sin descripción disponible"}
                                />
                              </Box>
                              <Box sx={{ textAlign: "right", mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {value.nombre} - {value.organizacion.nombre}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {Reconocido == null
                            ? "Selecciona un colaborador"
                            : "Cargando comportamientos..."}
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
                    label="Texto del Certificado (Visible en el certificado)"
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity="warning" sx={{ width: '100%' }}>
          Solo puedes seleccionar un máximo de 3 comportamientos.
        </MuiAlert>
      </Snackbar>
    </>
  );
}