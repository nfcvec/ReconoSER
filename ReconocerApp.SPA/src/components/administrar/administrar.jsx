import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { useTheme } from "../../contexts/ThemeContext"; // Importar el contexto del tema
import CRUDWalletSaldos from "./wallet/CRUDWalletSaldos";
import CRUDReconocimientos from "./solicitudes/CRUDReconocimientos";
import CRUDMarketplaceCompras from "./solicitudes/CRUDMarketplaceCompras";
import CrudPremios from "./premios/CrudPremios";
import CRUDCategorias from "./categorias/CRUDCategorias";
import CRUDOrganizaciones from "./organizaciones/CRUDOrganizaciones"; // Asegúrate de que esta ruta sea correcta

const Administrar = () => {
  const [activeSection, setActiveSection] = useState(null);
  const { darkMode } = useTheme(); // Obtener el estado del modo oscuro

  const renderSection = () => {
    switch (activeSection) {
      case "wallet-saldos":
        return <CRUDWalletSaldos />;
      case "reconocimientos":
        return <CRUDReconocimientos />;
      case "marketplace-compras":
        return <CRUDMarketplaceCompras />;
      case "premios":
        return <CrudPremios />;
      case "categorias":
        return <CRUDCategorias />;
      case "organizaciones":
        return <CRUDOrganizaciones />;
      default:
        return <p>Seleccione una sección para administrar.</p>;
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <h1>Administrar</h1>
      <Box sx={{ display: "flex", gap: 2, marginBottom: "20px" }}>
        <Button
          variant="contained"
          onClick={() => setActiveSection("wallet-saldos")}
        >
          Administrar Saldos de Billetera
        </Button>
        <Button
          variant="contained"
          onClick={() => setActiveSection("reconocimientos")}
        >
          Administrar Reconocimientos
        </Button>
        <Button
          variant="contained"
          onClick={() => setActiveSection("marketplace-compras")}
        >
          Administrar Compras del Marketplace
        </Button>
        <Button
          variant="contained"
          onClick={() => setActiveSection("premios")}
        >
          Administrar Premios
        </Button>
        <Button
          variant="contained"
          onClick={() => setActiveSection("categorias")}
        >
          Administrar Categorías
        </Button>
        <Button
          variant="contained"
          onClick={() => setActiveSection("organizaciones")}
        >
          Administrar Organizaciones
        </Button>
      </Box>
      <Box
        sx={{
          marginTop: "50px",
          padding: "20px",
          border: activeSection
            ? `2px solid ${darkMode ? "#ffffff" : "#000000"}` // Cambia el color del borde según el modo
            : "none",
          borderRadius: "8px",
          backgroundColor: darkMode ? "#333333" : "#f9f9f9", // Cambia el fondo según el modo
          color: darkMode ? "#ffffff" : "#000000", // Cambia el color del texto según el modo
        }}
      >
        {renderSection()}
      </Box>
    </Box>
  );
};

export default Administrar;