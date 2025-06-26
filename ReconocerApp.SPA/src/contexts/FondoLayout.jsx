import React from 'react';
import fondoReconoser from '../assets/fondo_Reconoser.png';

const FondoLayout = ({ children }) => {
  return (
    <>
      {/* Fondo fijo */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${fondoReconoser})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1,
        }}
      />
      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  );
};

export default FondoLayout;
