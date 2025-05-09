import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box, Slider, Pagination } from "@mui/material";
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

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const prizesPerPage = 10; // Cantidad de premios por página

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

        const premios = await getPremios();
              // 🔥 Log para verificar la cantidad de premios obtenidos desde la API
      console.log("Premios crudos obtenidos desde la API:", premios);
      console.log("Cantidad de premios antes de filtrar:", premios.length);

        if (!Array.isArray(premios)) {
          console.error("Los premios no son un array válido.");
          return;
        }

        const filteredPrizes = premios
          .filter((premio) => (
            premio.organizacion &&
            premio.organizacion.dominioEmail &&
            premio.organizacion.dominioEmail.toLowerCase().includes(domain)
          ))
          .sort((a, b) => a.costoWallet - b.costoWallet);

        setPrizes(filteredPrizes);
        setFilteredPrizes(filteredPrizes);

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
        premio.costoWallet >= priceRange[0] &&
        premio.costoWallet <= priceRange[1]
      )
      .sort((a, b) => a.costoWallet - b.costoWallet);
    setFilteredPrizes(filtered);
    setCurrentPage(1); // Reinicia la página al filtrar
  }, [priceRange, prizes]);

  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Calcular los premios de la página actual
  const indexOfLastPrize = currentPage * prizesPerPage;
  const indexOfFirstPrize = indexOfLastPrize - prizesPerPage;
  const currentPrizes = filteredPrizes.slice(indexOfFirstPrize, indexOfLastPrize);

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
        justifyContent: "center",
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

      <Box>
        <Typography gutterBottom>Filtrar por rango de ULIs:</Typography>
        <Slider
          value={priceRange}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
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
              imagenUrl={premio.imagenUrl}
              nombre={premio.nombre}
              descripcion={premio.descripcion}
              costoWallet={premio.costoWallet}
              canAfford={userBalance >= premio.costoWallet}
              premioId={premio.premioId}
            />
          </Grid>
        ))}
      </Grid>

      <Pagination
        count={Math.ceil(filteredPrizes.length / prizesPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 4 }}
      />
    </Box>
  );
}
