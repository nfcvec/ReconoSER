import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardActions, Typography, Container, Box } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";

export default function CanjeExito() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            ¡Canje Exitoso!
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Premio Canjeado
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "sm" }}>
              Tu canje se ha realizado con éxito. El premio será procesado y recibirás una notificación con los detalles.
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button variant="contained" onClick={() => navigate("/")}>
            Volver al Inicio
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}