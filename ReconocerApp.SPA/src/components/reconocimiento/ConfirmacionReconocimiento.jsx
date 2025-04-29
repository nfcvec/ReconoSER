import { Button, Card, CardContent, CardActions, Typography, Container, Box, List, ListItem, ListItemText } from "@mui/material";
import { createCertificado } from "../../utils/services/certificado";

export default function ConfirmacionReconocimiento({ data, onConfirm, onBack }) {
  const { selectedCollaborator, selectedValues, justification, certificateText, collaborators, institutionalValues, token } = data;

  const collaboratorName = collaborators.find((c) => c.id === selectedCollaborator)?.displayName || "No seleccionado";
  const selectedValuesDescriptions = selectedValues.map(
    (id) => institutionalValues.find((v) => v.comportamientoId === id)?.descripcion || "Valor no encontrado"
  );
  const selectedValuesTitles = selectedValues.map(
    (id) => institutionalValues.find((v) => v.comportamientoId === id)?.nombre || "Nombre no encontrado"
  );

  const handleConfirm = async () => {
    const payload = {
      reconocimientoId: 0,
      tokenColaborador: selectedCollaborator, // OID del colaborador seleccionado
      justificacion: justification,
      texto: certificateText,
      titulo: selectedValuesTitles.join(", "), // Nombres de los valores seleccionados
      fechaCreacion: new Date().toISOString(), // Fecha actual en formato ISO
      estado: "pendiente",
      comentarioRevision: "",
      fechaResolucion: "",
    };

    try {
      const response = await createCertificado(payload); // Llama a la API para crear el certificado
      console.log("Certificado creado exitosamente:", response);
      onConfirm(); // Llama al callback después de la confirmación
    } catch (error) {
      console.error("Error al crear el certificado:", error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Confirmación de Reconocimiento
          </Typography>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Colaborador Seleccionado:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {collaboratorName}
            </Typography>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Valores Institucionales Seleccionados:
            </Typography>
            <List>
              {selectedValuesDescriptions.map((description, index) => (
                <ListItem key={index}>
                  <ListItemText primary={description} />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Justificación:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {justification}
            </Typography>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Texto del Certificado:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {certificateText}
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onBack}>
            Regresar
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            Confirmar
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}