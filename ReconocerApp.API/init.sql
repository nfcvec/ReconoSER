-- Crear tabla Organizaciones
CREATE TABLE Organizaciones (
    OrganizacionId INTEGER PRIMARY KEY,
    Nombre TEXT NOT NULL,
    Descripcion TEXT NOT NULL,
    DominioEmail TEXT NOT NULL,
    Activa BOOLEAN NOT NULL
);

-- Insertar datos en Organizaciones
INSERT INTO Organizaciones (OrganizacionId, Nombre, DominioEmail, Descripcion, Activa) VALUES
(1, 'UDLA', 'udla.edu.ec', 'Universidad de Las Americas', true),
(2, 'ULatina', 'ulatina.cr', 'Universidad Latina de Costa Rica', true);

-- Crear tabla WalletSaldos
CREATE TABLE WalletSaldos (
    WalletSaldoId INTEGER PRIMARY KEY,
    TokenColaborador TEXT NOT NULL,
    SaldoActual INTEGER NOT NULL
);

-- Insertar datos en WalletSaldos
INSERT INTO WalletSaldos (WalletSaldoId, TokenColaborador, SaldoActual) VALUES
(1, 'asasasasas', 1000),
(2, 'sdasdasdas', 2000),
(3, 'e5625472-d883-47a2-936a-961b274e5177', 5000);

-- Crear tabla WalletTransacciones
CREATE TABLE Wallet
