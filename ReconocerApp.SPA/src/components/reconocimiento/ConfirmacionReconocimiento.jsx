import { Button, Card, CardContent, CardActions, Typography, Container, Box, List, ListItem, ListItemText } from "@mui/material";
import { solicitarReconocimiento } from "../../utils/services/certificado";
import { useMsal } from "@azure/msal-react";

export default function ConfirmacionReconocimiento({ data, onConfirm, onBack }) {
  const {accounts} = useMsal();
  const user = accounts[0];
  const { Reconocido, Comportamientos, Justificacion, Texto } = data;

  const handleConfirm = async () => {
    const payload = {
      reconocedorId: user?.idTokenClaims?.oid, // OID del usuario que está reconociendo
      reconocidoId: Reconocido.id, // OID del colaborador seleccionado
      justificacion: Justificacion,
      texto: Texto,
      estado: "pendiente",
      comportamientos: Comportamientos
    };

    try {
      const response = await solicitarReconocimiento(payload); // Llama a la API para crear el certificado
      console.log("Reconocimiento solicitado exitosamente:", response);
      onConfirm(); // Llama al callback después de la confirmación
    } catch (error) {
      console.error("Error al crear el certificado:", error);
    }
  };

  return (
    <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      textAlign: "center",
    }}>
      <pre>{JSON.stringify(Reconocido)}</pre>
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
              {Reconocido.displayName}
            </Typography>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Comportamientos:
            </Typography>
            <List>
              {Comportamientos.map((item) => (
                <ListItem key={item.comportamientoId}>
                  <ListItemText primary={item.descripcion} />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Justificación:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {Justificacion}
            </Typography>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              Texto del Certificado:
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {Texto}
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
    </Box>
  );
}