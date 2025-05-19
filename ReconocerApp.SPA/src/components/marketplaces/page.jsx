import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, Box, Slider, CircularProgress } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { getPremios } from "../../utils/services/premios";
import PremiosComponent from "./premiosComponent";
import { useWallet } from "../../contexts/WalletContext";
import { useOrganizacion } from "../../contexts/OrganizacionContext";
import { useLoading } from "../../contexts/LoadingContext";

export default function Marketplace() {
  const { instance } = useMsal();
  const [prizes, setPrizes] = useState([]);
  const [filteredPrizes, setFilteredPrizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000); // Estado para el precio máximo
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const { wallet, loading: walletLoading, refreshWallet } = useWallet();
  const userBalance = wallet?.saldoActual ?? null;
  const {organizacion} = useOrganizacion();
  const { showLoading, hideLoading } = useLoading(); // Usar el contexto de carga

  useEffect(() => {
    if (refreshWallet) {
      refreshWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('[Marketplace] useEffect premios ejecutado', { organizacion, instance });
    if (!organizacion) return; // Espera a que organización esté disponible
    const fetchData = async () => {
      showLoading("Cargando premios...");
      try {
        const premios = await getPremios({
          filters: [
            {
              field: "OrganizacionId",
              operator: "eq",
              value: `${organizacion.organizacionId}`
            }
          ],
          orderBy: "CostoWallet",
          orderDirection: "asc",
        });
        console.log('[Marketplace] premios obtenidos', premios);
        if (!Array.isArray(premios)) {
          console.error("Los premios no son un array válido.");
          return;
        }

        setPrizes(premios);
        setFilteredPrizes(premios);

        // Calcular el precio máximo dinámicamente
        const maxCosto = Math.max(...premios.map((premio) => premio.costoWallet));
        setMaxPrice(maxCosto);
        setPriceRange([0, maxCosto]); // Ajustar el rango inicial
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
      } finally {
        hideLoading();
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log('[Marketplace] useEffect filtro ejecutado', { prizes, priceRange, searchTerm });
    const filtered = prizes
      .filter((premio) =>
        premio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) // Filtrar por nombre
      )
      .filter((premio) =>
        premio.costoWallet >= priceRange[0] && premio.costoWallet <= priceRange[1] // Filtrar por rango de precios
      )
    setFilteredPrizes(filtered);
  }, [priceRange, prizes, searchTerm]);

  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const currentPrizes = filteredPrizes; // Mostrar todos los premios sin paginación

  if (walletLoading || userBalance === null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
      </Box>
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

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }} color="primary">
        Tu saldo actual: <strong>{userBalance} ULIs</strong>
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
        Solo los premios con el botón <strong>Canjear</strong> activado pueden ser canjeados con tu saldo actual.
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
