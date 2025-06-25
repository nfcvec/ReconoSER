import React from 'react';
import fondoReconoser from '../assets/fondo_reconoser.jpg'; // Cambiado a la imagen correcta

const FondoLayout = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${fondoReconoser})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    >
      {/* Fondo visual, los hijos van en un contenedor aparte para mantener el layout */}
    </div>
  );
};

export default FondoLayout;
