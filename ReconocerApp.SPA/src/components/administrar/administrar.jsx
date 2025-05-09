import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import CRUDWalletSaldos from "./wallet/CRUDWalletSaldos";
import CRUDReconocimientos from "./solicitudes/CRUDReconocimientos";
import CRUDMarketplaceCompras from "./solicitudes/CRUDMarketplaceCompras";
import CRUDPremios from "./premios/CRUDPremios";
import CRUDCategorias from "./categorias/CRUDCategorias";

const Administrar = () => {
  const [activeSection, setActiveSection] = useState(null);

  const renderSection = () => {
    switch (activeSection) {
      case "wallet-saldos":
        return <CRUDWalletSaldos />;
      case "reconocimientos":
        return <CRUDReconocimientos />;
      case "marketplace-compras":
        return <CRUDMarketplaceCompras />;
      case "premios":
        return <CRUDPremios />;
      case "categorias":
        return <CRUDCategorias />;
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
      </Box>
      <Box sx={{ marginTop: "50px", padding: "20px",
          border: activeSection ? "2px solid black" : "none", 
          borderRadius: "8px", 
          backgroundColor: "#f9f9f9", }}>{renderSection()}</Box>
    </Box>
  );
};

export default Administrar;