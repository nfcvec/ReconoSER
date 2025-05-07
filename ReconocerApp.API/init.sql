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

-- Crear tabla Comportamientos
CREATE TABLE Comportamientos (
    ComportamientoId INTEGER PRIMARY KEY,
    OrganizacionId INTEGER NOT NULL,
    Nombre TEXT NOT NULL,
    Descripcion TEXT NOT NULL,
    WalletOtorgados INTEGER NOT NULL,
    FOREIGN KEY (OrganizacionId) REFERENCES Organizaciones (OrganizacionId)
);

-- Insertar datos en Comportamientos
INSERT INTO Comportamientos (OrganizacionId, Nombre, Descripcion, WalletOtorgados) VALUES
(1, 'Inclusión/Humanismo', 'Toma en cuenta las sugerencias y experiencias de los demás, manteniendo una actitud abierta a aprender de otros y fomentando un ambiente de confianza y colaboración.', 2),
(1, 'Inclusión/Humanismo', 'Reconoce y valida las emociones de los demás, identificando las fortalezas y habilidades de cada uno para el logro de los objetivos comunes.', 4),
(1, 'Resiliencia', 'Se muestra seguro de sí mismo y supera cualquier obstáculo para alcanzar sus objetivos.', 2),
(1, 'Resiliencia', 'Brinda soluciones efectivas a los problemas que se le presentan, demostrando capacidad para superar obstáculos y adaptarse a las circunstancias.', 4),
(2, 'Respeto', 'Sabe escuchar y es receptivo a las opiniones de los demás mostrando interés genuino a las solicitudes, asegurando un servicio respetuoso y efectivo.', 4),
(2, 'Respeto', 'Se dirige a todos con amabilidad, mostrando interés en sus ideas y perspectivas.', 2),
(2, 'Integridad', 'Reconoce los errores cometidos, aprende de ellos y los rectifica, promoviendo la transparencia en sus acciones.', 2),
(2, 'Integridad', 'Piensa y actúa de manera consciente, sin afectar los intereses de los demás, incluso cuando nadie lo está observando.', 4);

-- Crear tabla WalletTransacciones
CREATE TABLE Wallet
