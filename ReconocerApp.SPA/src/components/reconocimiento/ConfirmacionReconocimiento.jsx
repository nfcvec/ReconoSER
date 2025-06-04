import { Button, Card, CardContent, CardActions, Typography, Container, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { solicitarReconocimiento } from "../../utils/services/certificado";
import { useMsal } from "@azure/msal-react";
import { useLoading } from "../../contexts/LoadingContext";

export default function ConfirmacionReconocimiento({ data, onConfirm, onBack }) {
  const { instance } = useMsal();
  const user = instance.getActiveAccount();
  const { Reconocido, Comportamientos, Justificacion, Texto } = data;
  const { showLoading, hideLoading } = useLoading(); // Corrected function names

  const handleConfirm = async () => {
    showLoading("Solicitando reconocimiento..."); // Corrected function name
    const payload = {
      reconocedorId: user?.idTokenClaims?.oid, // OID del usuario que está reconociendo
      reconocidoId: Reconocido.id, // OID del colaborador seleccionado
      justificacion: Justificacion,
      texto: Texto,
      estado: "Pendiente",
      comportamientos: Comportamientos
    };

    try {
      const response = await solicitarReconocimiento(payload); // Llama a la API para crear el certificado
      console.log("Reconocimiento solicitado exitosamente:", response);
      onConfirm(); // Llama al callback después de la confirmación
    } catch (error) {
      console.error("Error al crear el certificado:", error);
    }
    hideLoading(); // Corrected function name
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
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            <strong>Confirmación de Reconocimiento</strong>
          </Typography>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              <strong>Colaborador Reconocido:</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              <strong>{Reconocido.displayName}</strong>
            </Typography>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <TableContainer component={Paper} sx={{ mt: 1, maxWidth: 1200 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Valor</strong></TableCell>
                    <TableCell><strong>Comportamiento</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Comportamientos.map((item) => (
                    <TableRow key={item.comportamientoId}>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              <strong>Justificación:</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {Justificacion}
            </Typography>
          </Box>
          <Box sx={{ my: 3, textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              <strong>Texto para el Certificado:</strong>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {Texto}
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onBack}>
            <strong>Regresar</strong>
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            <strong>Confirmar</strong>
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}