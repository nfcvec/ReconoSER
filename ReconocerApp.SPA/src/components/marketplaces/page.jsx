import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box, Slider } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { getPremios } from "../../utils/services/premios";
import { getWalletBalanceByUserId } from "../../utils/services/walletBalance.js"; 
import PremiosComponent from "./premiosComponent";

export default function Marketplace() {
  const { instance } = useMsal();
  const [prizes, setPrizes] = useState([]);
  const [filteredPrizes, setFilteredPrizes] = useState([]);
  const [userBalance, setUserBalance] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]); // Default range

  useEffect(() => {
    const fetchData = async () => { 
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          console.error("No active account! Please log in.");
          return;
        }

        const email = account.username;
        const domain = email.split("@")[1].toLowerCase();
        console.log("Dominio del usuario:", domain);

        const premios = await getPremios();
        console.log("Datos de premios obtenidos:", premios);

        if (!Array.isArray(premios)) {
          console.error("Los premios no son un array válido.");
          return;
        }

        const filteredPrizes = premios.filter((premio) => {
          return (
            premio.organizacion &&
            premio.organizacion.dominioEmail &&
            premio.organizacion.dominioEmail.toLowerCase().includes(domain)
          );
        });

        console.log("Premios filtrados:", filteredPrizes);
        setPrizes(filteredPrizes);
        setFilteredPrizes(filteredPrizes);

        //traer el saldo de la wallet
        const userId = account.localAccountId; 
        const walletData = await getWalletBalanceByUserId(userId);
        console.log("Wallet data:", walletData);

        setUserBalance(walletData.saldoActual); // saldo real
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
      }
    };

    fetchData();
  }, [instance]);

  // Filter prizes based on price range
  useEffect(() => {
    const filtered = prizes.filter(
      (premio) =>
        premio.costoWallet >= priceRange[0] && premio.costoWallet <= priceRange[1]
    );
    setFilteredPrizes(filtered);
  }, [priceRange, prizes]);

  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  if (userBalance === null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Cargando tu saldo...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
        Marketplace
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Canjea tus ULIs por premios exclusivos.
      </Typography>

      {/* Slider for price range */}
      <Box sx={{ mb: 4, width: "50%" }}>
        <Typography gutterBottom>Filtrar por rango de ULIs:</Typography>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000} // Adjust max value as needed
        />
        <Typography>
          Rango seleccionado: {priceRange[0]} - {priceRange[1]} ULIs
        </Typography>
      </Box>

      {filteredPrizes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No se encontraron premios disponibles.</Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        {filteredPrizes.map((premio) => (
          <Grid item xs={12} sm={6} md={4} key={premio.premioId}>
            <PremiosComponent
              imagenUrl={premio.imagenUrl}
              nombre={premio.nombre}
              descripcion={premio.descripcion}
              costoWallet={premio.costoWallet}
              canAfford={userBalance >= premio.costoWallet} // Comparar saldo con el costo
              premioId={premio.premioId}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}