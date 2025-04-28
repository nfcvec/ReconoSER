import { useNavigate } from "react-router-dom"
import { useMsal } from "@azure/msal-react"
import { Button, Card, CardContent, CardActions, Typography, Container, Box } from "@mui/material"
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material"

export default function ReconocimientoExito() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            ¡Reconocimiento Enviado!
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Certificado Generado
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "sm" }}>
              El certificado de reconocimiento ha sido generado y enviado con éxito. El colaborador recibirá una
              notificación y los ULIs correspondientes a los valores destacados.
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/certificados")}>
            Ver Certificados
          </Button>
          <Button variant="contained" onClick={() => navigate("/")}>
            Volver al Inicio
          </Button>
        </CardActions>
      </Card>
    </Container>
  )
}

