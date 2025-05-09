import React from "react";
import { Link } from "react-router-dom";

const Administrar = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Administrar</h1>
      <nav style={{ marginBottom: "20px" }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link to="/administrar/wallet-saldos">Administrar Saldos de Billetera</Link>
          </li>
          <li>
            <Link to="/administrar/reconocimientos">Administrar Reconocimientos</Link>
          </li>
          <li>
            <Link to="/administrar/marketplace-compras">Administrar Compras del Marketplace</Link>
          </li>
          <li>
            <Link to="/administrar/premios">Administrar Premios</Link>
          </li>
          <li>
            <Link to="/administrar/categorias">Administrar Categorías</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Administrar;