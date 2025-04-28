import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, Typography, Container, Box } from "@mui/material";
import { getPremioById } from "../../utils/services/premios";

export default function PrizeDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtiene el ID del premio desde la URL
  console.log("ID del premio desde la URL:", id);
  const [prize, setPrize] = useState(null); // Aquí se cargará el premio desde la API

  useEffect(() => {
    if (!id) {
      console.error("El ID del premio no está definido.");
      return;
    }

    const fetchPrize = async () => {
      try {
        const premio = await getPremioById(id); // Obtiene el premio por ID
        setPrize(premio);
      } catch (error) {
        console.error("Error al obtener el premio:", error.message);
      }
    };

    fetchPrize();
  }, [id]);

  if (!prize) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Premio no encontrado
        </Typography>
        <Button variant="contained" onClick={() => navigate("/marketplace")}>
          Volver al Marketplace
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ p: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Confirmación de Premio
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom>
            {prize.nombre}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {prize.descripcion}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Puntos requeridos: {prize.costoWallet}
          </Typography>
        </CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/marketplace")}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={() => handleConfirm(prize.premioId)}>
            Confirmar Canje
          </Button>
        </Box>
      </Card>
    </Container>
  );

  function handleConfirm(prizeId) {
    console.log("Premio confirmado con ID:", prizeId);
    navigate("/marketplace");
  }
}