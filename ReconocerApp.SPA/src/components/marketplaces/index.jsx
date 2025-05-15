import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, Typography, Container, Box, CardMedia } from "@mui/material";
import { getPremioById, getPremioImages } from "../../utils/services/premios";
import { getWalletBalanceByUserId } from "../../utils/services/walletBalance";
import { createPremioCompra } from "../../utils/services/premiosCompra";
import { useMsal } from "@azure/msal-react";
import { useLoading } from "../../contexts/LoadingContext"; // Importar el LoadingContext

export default function PrizeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { instance } = useMsal();
  const { showLoading, hideLoading } = useLoading(); // Usar el contexto de carga

  const [prize, setPrize] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [imagenUrl, setImagenUrl] = useState(null);

  useEffect(() => {
    const fetchPrizeAndWalletData = async () => {
      try {
        if (!id) {
          console.error("El ID del premio no está definido.");
          return;
        }

        const account = instance.getActiveAccount();
        if (!account) {
          console.error("No active account! Please log in.");
          return;
        }

        const userId = account.localAccountId;

        const premio = await getPremioById(id);
        setPrize(premio);

        const wallet = await getWalletBalanceByUserId(userId);
        setWalletData(wallet);

        console.log("Premio obtenido:", premio);
        console.log("Wallet data obtenida:", wallet);

        // Obtener la imagen del premio
        const images = await getPremioImages(id);
        if (images.length > 0) {
          const image = images[0];
          setImagenUrl(`data:image/jpeg;base64,${image.content}`);
        } else {
          setImagenUrl("https://via.placeholder.com/250");
        }
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
      }
    };

    fetchPrizeAndWalletData();
  }, [id, instance]);

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

async function handleConfirm(prizeId) {
  if (!prize || !walletData) {
    console.error("Datos incompletos para confirmar canje.");
    return;
  }

  try {
    // Mostrar el indicador de carga
    showLoading("Procesando el canje...");

    const payload = {
      tokenColaborador: walletData.tokenColaborador,
      premioId: prize.premioId,
      fechaCompra: new Date().toISOString(),
      estado: "pendiente",
      comentarioRevision: "",
    };

    console.log("Payload enviado:", payload);

    const response = await createPremioCompra(payload);
    console.log("Solicitud creada exitosamente:", response);

    // Asegurar que el indicador de carga se muestre al menos 2 segundos
    setTimeout(() => {
      hideLoading();
      navigate("/canjeExito");
    }, 2000); // 2 segundos de retraso
  } catch (error) {
    console.error("Error al crear la solicitud:", error.response?.data || error.message);

    // Asegurar que el indicador de carga se muestre al menos 2 segundos
    setTimeout(() => {
      hideLoading(); // Ocultar el indicador de carga en caso de error
    }, 2000);

    if (error.response?.data?.errors) {
      console.error("Errores de validación:", error.response.data.errors);
      Object.entries(error.response.data.errors).forEach(([field, messages]) => {
        console.error(`Campo: ${field}, Errores: ${messages.join(", ")}`);
      });
      alert("Error al procesar el canje: " + error.response.data.title);
    } else {
      alert("Hubo un error al procesar tu canje. 😔");
    }
  }
}

  return (
    <Box>
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
          {imagenUrl && (
            <CardMedia
              component="img"
              height="200"
              image={imagenUrl}
              alt={prize.nombre}
              sx={{
                objectFit: "contain",
                marginBottom: 2,
                padding: 2,
              }}
            />
          )}
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
    </Box>
  );
}