import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, Typography, Container, Box } from "@mui/material";
import { getPremioById } from "../../utils/services/premios";
import { getWalletBalanceByUserId } from "../../utils/services/walletBalance";
import { createWalletTransaction } from "../../utils/services/walletTransaccion"; // 👈 Importar API para crear transacción
import { useMsal } from "@azure/msal-react"; // 👈 MSAL para obtener usuario

export default function PrizeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { instance } = useMsal();

  const [prize, setPrize] = useState(null);
  const [walletData, setWalletData] = useState(null);

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

        // (Opcional) Puedes loguear para ver que ya tienes todo
        console.log("Premio obtenido:", premio);
        console.log("Wallet data obtenida:", wallet);
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

  function handleConfirm(prizeId) {
    if (!prize || !walletData) {
      console.error("Datos incompletos para confirmar canje.");
      return;
    }
  
    const payload = {
      WalletSaldo: {
        walletSaldoId: walletData.walletSaldoId || 0,
        TokenColaborador: walletData.tokenColaborador || "",
      },
      categoriaId: prize.categoria?.categoriaId || 0,
      cantidad: prize.costoWallet || 0,
      descripcion: `Canje de premio: ${prize.nombre}`,
      fecha: new Date().toISOString(),
    };
  
    console.log("Payload enviado:", payload);
  
    createWalletTransaction(payload)
      .then((response) => {
        console.log("Transacción creada exitosamente:", response);
        alert("¡Canje exitoso! 🎉");
        navigate("/marketplace");
      })
      .catch((error) => {
        console.error("Error al crear la transacción:", error.response?.data || error.message);
        if (error.response && error.response.data) {
          alert(`Error al procesar el canje: ${error.response.data.title || "Error desconocido"}`);
          if (error.response.data.errors) {
            console.error("Errores de validación:", error.response.data.errors);
            Object.entries(error.response.data.errors).forEach(([field, messages]) => {
              console.error(`Campo: ${field}, Errores: ${messages.join(", ")}`);
            });
          }
        } else {
          alert("Hubo un error al procesar tu canje. 😔");
        }
      });
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
}
