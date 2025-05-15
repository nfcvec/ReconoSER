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
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000); // Estado para el precio máximo
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  useEffect(() => {
    const fetchData = async () => {
      try {
        const account = instance.getActiveAccount();
        if (!account) {
          console.error("No active account! Please log in.");
          return;
        }

        const email = account.username;

        const premios = await getPremios();
        console.log("Premios crudos obtenidos desde la API:", premios);
        console.log("Cantidad de premios antes de filtrar:", premios.length);

        if (!Array.isArray(premios)) {
          console.error("Los premios no son un array válido.");
          return;
        }

        const filteredPrizes = premios.sort((a, b) => a.costoWallet - b.costoWallet);

        setPrizes(filteredPrizes);
        setFilteredPrizes(filteredPrizes);

        // Calcular el precio máximo dinámicamente
        const maxCosto = Math.max(...filteredPrizes.map((premio) => premio.costoWallet));
        setMaxPrice(maxCosto);
        setPriceRange([0, maxCosto]); // Ajustar el rango inicial

        const userId = account.localAccountId;

        console.log("Premios obtenidos:", filteredPrizes);
        const walletData = await getWalletBalanceByUserId(userId);

        console.log("Premios obtenidos:", filteredPrizes);
        setUserBalance(walletData.saldoActual);
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
      }
    };

    fetchData();
  }, [instance]);

  useEffect(() => {
    const filtered = prizes
      .filter((premio) =>
        premio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) // Filtrar por nombre
      )
      .filter((premio) =>
        premio.costoWallet >= priceRange[0] && premio.costoWallet <= priceRange[1] // Filtrar por rango de precios
      )
      .sort((a, b) => a.costoWallet - b.costoWallet);
    setFilteredPrizes(filtered);
  }, [priceRange, prizes, searchTerm]);

  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const currentPrizes = filteredPrizes; // Mostrar todos los premios sin paginación

  if (userBalance === null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Cargando tu saldo...</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "80vh",
        gap: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h4">
        <strong>Marketplace</strong>
      </Typography>
      <Typography variant="body1">
        Canjea tus ULIs por premios exclusivos.
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 600, mb: 2 }}>
        <input
          type="text"
          placeholder="Buscar premios por nombre"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </Box>

      <Box>
        <Typography gutterBottom>Filtrar por rango de ULIs:</Typography>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={0}
          max={maxPrice} // Usar el precio máximo dinámico
        />
        <Typography>
          Rango seleccionado: {priceRange[0]} - {priceRange[1]} ULIs
        </Typography>
      </Box>

      {currentPrizes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">No se encontraron premios disponibles.</Typography>
        </Box>
      )}

      <Grid container spacing={4} justifyContent="center">
        {currentPrizes.map((premio) => (
          <Grid item key={premio.premioId}>
            <PremiosComponent
              premio={premio}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
