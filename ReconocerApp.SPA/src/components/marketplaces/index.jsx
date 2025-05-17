import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, Typography, Container, Box, CardMedia, ImageList, ImageListItem, Dialog } from "@mui/material";
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
  const [imagenes, setImagenes] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

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
        const images = await getPremioImages(premio.premioId);
        setImagenes(images);

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

    showLoading("Procesando el canje...");
    try {
      const payload = {
        tokenColaborador: walletData.tokenColaborador,
        premioId: prize.premioId,
        fechaCompra: new Date().toISOString(),
        estado: "pendiente",
        comentarioRevision: "",
      };
      await createPremioCompra(payload);
      hideLoading();
      navigate("/canjeExito");
    } catch (error) {
      hideLoading();
      if (error.response?.data?.errors) {
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
          {imagenes && Array.isArray(imagenes) && imagenes.length > 0 && (
            <Box sx={{ my: 2 }}>
              <ImageList sx={{ width: 500, height: 250 }} cols={3} rowHeight={120}>
                {imagenes.map((img, idx) => (
                  <ImageListItem key={idx}>
                    <img
                      src={`data:image/jpeg;base64,${img.content}`}
                      alt={`Premio imagen ${idx + 1}`}
                      loading="lazy"
                      style={{ objectFit: "contain", width: "100%", height: "100%", cursor: "pointer" }}
                      onClick={() => {
                        setSelectedImg(`data:image/jpeg;base64,${img.content}`);
                        setDialogOpen(true);
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md">
            <Box sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "background.paper" }}>
              {selectedImg && (
                <img src={selectedImg} alt="Imagen grande" style={{ maxWidth: "80vw", maxHeight: "80vh" }} />
              )}
            </Box>
          </Dialog>
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