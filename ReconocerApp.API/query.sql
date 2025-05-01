PRAGMA table_info('MarketplacePremios');

SELECT sql 
FROM sqlite_master 
WHERE type = 'table' AND name = 'MarketplacePremios';

SELECT *
FROM Organizaciones o
LEFT JOIN Colaboradores c
ON o.OrganizacionId = c.OrganizacionId
WHERE o.Nombre = 'ULatina'


-- quiero todas las tablas de mi base de datos
SELECT * 
FROM sqlite_master
WHERE type = 'table';

PRAGMA table_info(WalletSaldos);

SELECT * FROM WalletSaldos;

SELECT * 
FROM WalletTransacciones 
WHERE WalletSaldoId NOT IN (SELECT WalletSaldoId FROM WalletSaldos);


PRAGMA foreign_key_list('WalletTransacciones');

PRAGMA table_info('WalletTransacciones');
PRAGMA foreign_key_list('WalletTransacciones');
-- 1. Renombrar la tabla original
ALTER TABLE WalletTransacciones RENAME TO WalletTransacciones_old;

-- 2. Crear una nueva tabla sin la FK
CREATE TABLE WalletTransacciones (
    TransaccionId INTEGER PRIMARY KEY,
    ColaboradorId TEXT,
    CategoriaId INTEGER NOT NULL,
    Cantidad INTEGER NOT NULL,
    Descripcion TEXT NOT NULL,
    Fecha TEXT NOT NULL
    -- Nota: no se define ninguna FOREIGN KEY aquí
);


/* insertar una organizacion tiene los atributos de nombre,d ominio  email, descripcion, activa.

 public int OrganizacionId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string DominioEmail { get; set; } = string.Empty;
    public bool Activa { get; set; }
    */
INSERT  INTO Organizaciones (OrganizacionId, Nombre, DominioEmail, Descripcion, Activa) VALUES
(1, 'UDLA', 'udla.edu.ec', 'Universidad de Las Americas', true),
(2, 'ULatina', 'ulatina.cr', 'Universidad Latina de Costa Rica', true);


SELECT * FROM WalletSaldos;

-- 3. Copiar los datos desde la tabla vieja a la nueva
INSERT INTO WalletTransacciones (TransaccionId, ColaboradorId, CategoriaId, Cantidad, Descripcion, Fecha)
SELECT TransaccionId, ColaboradorId, CategoriaId, Cantidad, Descripcion, Fecha
FROM WalletTransacciones_old;

-- 4. Eliminar la tabla antigua
DROP TABLE WalletTransacciones_old;

SELECT *
FROM WalletTransacciones
WHERE WalletSaldoId IS NOT NULL
AND WalletSaldoId NOT IN (SELECT WalletSaldoId FROM WalletSaldos);

PRAGMA table_info('WalletSaldos');


INSERT INTO WalletSaldos (WalletSaldoId,TokenColaborador, SaldoActual) VALUES
(1, "asasasasas", 1000),
(2, "sdasdasdas", 2000);


-- insertar transaccion para el colaborador abcde
INSERT INTO WalletTransacciones (TransaccionId, WalletSaldoId, TokenColaborador, CategoriaId, Cantidad, Descripcion, Fecha)
VALUES
(1, 1, 'asasasasas', 1, 100, 'Compra de premio 1', '2023-01-01');

-- actualizar walletsaldo para el colaborador 3
UPDATE WalletSaldos 
SET SaldoActual = (SELECT COALESCE(SUM(Cantidad), 0) FROM WalletTransacciones WHERE TokenColaborador = 'e5625472-d883-47a2-936a-961b274e5177')
WHERE TokenColaborador = 'e5625472-d883-47a2-936a-961b274e5177';

--actualizar el saldo de la wallet del id3
UPDATE WalletSaldos 
SET SaldoActual = SaldoActual - (
  SELECT COALESCE(SUM(Cantidad), 0)
  FROM WalletTransacciones
  WHERE TokenColaborador = WalletSaldos.TokenColaborador
)
WHERE TokenColaborador = 'e5625472-d883-47a2-936a-961b274e5177';


SELECT * FROM WalletSaldos;
SELECT * FROM WalletTransacciones;
--eliminar una transaccion de la wallet
DELETE FROM WalletTransacciones WHERE TransaccionId = 4;


-- Insert
SELECT * FROM Categorias;
INSERT INTO Categorias (CategoriaId, Nombre, Descripcion) VALUES
(1, 'Categoria 1', 'Descripción de la Categoria 1'),
(2, 'Categoria 2', 'Descripción de la Categoria 2'),
(3, 'Categoria 3', 'Descripción de la Categoria 3'),
(4, 'Categoria 4', 'Descripción de la Categoria 4'),
(5, 'Categoria 5', 'Descripción de la Categoria 5');

INSERT INTO Comportamientos (OrganizacionId, Nombre, Descripcion, WalletOtorgados) VALUES
(2, 'Inclusión/Humanismo', 'Toma en cuenta las sugerencias y experiencias de los demás, manteniendo una actitud abierta a aprender de otros y fomentando un ambiente de confianza y colaboración.', 2),
(2, 'Inclusión/Humanismo', 'Reconoce y valida las emociones de los demás, identificando las fortalezas y habilidades de cada uno para el logro de los objetivos comunes.', 4),
(2, 'Resiliencia', 'Se muestra seguro de sí mismo y supera cualquier obstáculo para alcanzar sus objetivos.', 2),
(2, 'Resiliencia', 'Brinda soluciones efectivas a los problemas que se le presentan, demostrando capacidad para superar obstáculos y adaptarse a las circunstancias.', 4),
(2, 'Respeto', 'Sabe escuchar y es receptivo a las opiniones de los demás mostrando interés genuino a las solicitudes, asegurando un servicio respetuoso y efectivo.', 4),
(2, 'Respeto', 'Se dirige a todos con amabilidad, mostrando interés en sus ideas y perspectivas.', 2),
(2, 'Integridad', 'Reconoce los errores cometidos, aprende de ellos y los rectifica, promoviendo la transparencia en sus acciones.', 2),
(2, 'Integridad', 'Piensa y actúa de manera consciente, sin afectar los intereses de los demás, incluso cuando nadie lo está observando.', 4),
(2, 'Innovación', 'Establece objetivos específicos y cuantificables para mejorar su desempeño en sus funciones diarias.', 2),
(2, 'Innovación', 'Utiliza el análisis de datos para identificar áreas de mejora y desarrollar estrategias enfocadas en la calidad.', 4),
(2, 'Flexibilidad', 'Expresa sus opiniones basadas en su conocimiento y experiencia, enriqueciendo el debate y generando soluciones.', 4),
(2, 'Flexibilidad', 'Fomenta la libertad para aprender, investigar y compartir conocimiento.', 2),
(2, 'Búsqueda de la excelencia', 'Visualiza oportunidades y transforma procesos o procedimientos que generen mayor valor para la Institución.', 4),
(2, 'Búsqueda de la excelencia', 'Implementa ideas de manera efectiva en su rutina diaria que impulsan nuevos proyectos en su puesto de trabajo.', 2),
(2, 'Exponencial', 'Muestra disposición para salir de su zona de confort al hacer diferentes tareas con grupos multidisciplinarios según sea necesario.', 4),
(2, 'Exponencial', 'Demuestra apertura cuando se presenta nueva información o evidencia contraria.', 2),
(2, 'Libertad Académica', 'Busca oportunidades de desarrollo y crecimiento constante.', 2),
(2, 'Libertad Académica', 'Asume desafíos y retos con pasión y determinación.', 4),
(2, 'Comunicación asertiva', 'Comunica sus ideas y emociones de forma directa y comprensible, manteniendo siempre un tono respetuoso y considerado hacia los demás.', 2),
(2, 'Comunicación asertiva', 'Adapta su lenguaje verbal y no verbal según la audiencia y el contexto, asegurando una comunicación bidireccional efectiva que facilite el logro de los objetivos establecidos.', 4),
(2, 'Liderazgo', 'Fomenta un ambiente de colaboración, alentando a los miembros del equipo a compartir conocimientos y trabajar juntos para alcanzar objetivos comunes.', 2),
(2, 'Liderazgo', 'Inspira al equipo a superar sus propios límites para desarrollar habilidades que impulsen su crecimiento.', 4),
(2, 'Pensamiento crítico', 'Analiza la información, hechos y evidencias antes de tomar una decisión.', 2),
(2, 'Pensamiento crítico', 'Analiza a profundidad la causa principal de un problema y desarrolla soluciones efectivas.', 4);

--insertar comportamientos para la organizacion 1 
INSERT INTO Comportamientos (OrganizacionId, Nombre, Descripcion, WalletOtorgados) VALUES
(1, 'Inclusión/Humanismo', 'Toma en cuenta las sugerencias y experiencias de los demás, manteniendo una actitud abierta a aprender de otros y fomentando un ambiente de confianza y colaboración.', 2),
(1, 'Inclusión/Humanismo', 'Reconoce y valida las emociones de los demás, identificando las fortalezas y habilidades de cada uno para el logro de los objetivos comunes.', 4),
(1, 'Resiliencia', 'Se muestra seguro de sí mismo y supera cualquier obstáculo para alcanzar sus objetivos.', 2),
(1, 'Resiliencia', 'Brinda soluciones efectivas a los problemas que se le presentan, demostrando capacidad para superar obstáculos y adaptarse a las circunstancias.', 4),
(1, 'Respeto', 'Sabe escuchar y es receptivo a las opiniones de los demás mostrando interés genuino a las solicitudes, asegurando un servicio respetuoso y efectivo.', 4),
(1, 'Respeto', 'Se dirige a todos con amabilidad, mostrando interés en sus ideas y perspectivas.', 2),
(1, 'Integridad', 'Reconoce los errores cometidos, aprende de ellos y los rectifica, promoviendo la transparencia en sus acciones.', 2),
(1, 'Integridad', 'Piensa y actúa de manera consciente, sin afectar los intereses de los demás, incluso cuando nadie lo está observando.', 4),
(1, 'Innovación', 'Establece objetivos específicos y cuantificables para mejorar su desempeño en sus funciones diarias.', 2),
(1, 'Innovación', 'Utiliza el análisis de datos para identificar áreas de mejora y desarrollar estrategias enfocadas en la calidad.', 4),
(1, 'Flexibilidad', 'Expresa sus opiniones basadas en su conocimiento y experiencia, enriqueciendo el debate y generando soluciones.', 4),
(1, 'Flexibilidad', 'Fomenta la libertad para aprender, investigar y compartir conocimiento.', 2),
(1, 'Búsqueda de la excelencia', 'Visualiza oportunidades y transforma procesos o procedimientos que generen mayor valor para la Institución.', 4),
(1, 'Búsqueda de la excelencia', 'Implementa ideas de manera efectiva en su rutina diaria que impulsan nuevos proyectos en su puesto de trabajo.', 2);

SELECT * FROM Comportamientos;

--insertar premios
SELECT * FROM MarketplacePremios;
INSERT INTO MarketplacePremios (PremioId, OrganizacionId, CategoriaId, Nombre, Descripcion, CostoWallet, ImagenUrl, CantidadActual, UltimaActualizacion)
VALUES
-- Premios para OrganizacionId = 1
(1, 1, 1, 'Premio 1 Org 1', 'Descripción del Premio 1 para Organización 1', 100, 'https://example.com/imagen1.jpg', 10, '2023-01-01'),
(2, 1, 1, 'Premio 2 Org 1', 'Descripción del Premio 2 para Organización 1', 200, 'https://example.com/imagen2.jpg', 20, '2023-01-02'),
(3, 1, 1, 'Premio 3 Org 1', 'Descripción del Premio 3 para Organización 1', 300, 'https://example.com/imagen3.jpg', 30, '2023-01-03'),
(4, 1, 1, 'Premio 4 Org 1', 'Descripción del Premio 4 para Organización 1', 400, 'https://example.com/imagen4.jpg', 40, '2023-01-04'),
(5, 1, 1, 'Premio 5 Org 1', 'Descripción del Premio 5 para Organización 1', 500, 'https://example.com/imagen5.jpg', 50, '2023-01-05'),

-- Premios para OrganizacionId = 2
(6, 2, 1, 'Premio 1 Org 2', 'Descripción del Premio 1 para Organización 2', 150, 'https://example.com/imagen6.jpg', 15, '2023-02-01'),
(7, 2, 1, 'Premio 2 Org 2', 'Descripción del Premio 2 para Organización 2', 250, 'https://example.com/imagen7.jpg', 25, '2023-02-02'),
(8, 2, 1, 'Premio 3 Org 2', 'Descripción del Premio 3 para Organización 2', 350, 'https://example.com/imagen8.jpg', 35, '2023-02-03'),
(9, 2, 1, 'Premio 4 Org 2', 'Descripción del Premio 4 para Organización 2', 450, 'https://example.com/imagen9.jpg', 45, '2023-02-04'),
(10, 2, 1, 'Premio 5 Org 2', 'Descripción del Premio 5 para Organización 2', 550, 'https://example.com/imagen10.jpg', 55, '2023-02-05');



SELECT * from MarketplacePremios;
--actulizar imagenURL de  todos los premios de id 1 al 10 de MarketplacePremios
UPDATE MarketplacePremios
SET ImagenUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQQz6U1tB5iHhdMElk-2f2AxZ2-aaKQxhc3g&s'
WHERE PremioId BETWEEN 1 AND 10;

--actualizar el saldo de la wallet del id3
UPDATE WalletSaldos
SET SaldoActual = 500
WHERE WalletSaldoId = 3;
--actulizar 

SELECT * FROM MarketplacePremios WHERE PremioId = 1;

-- insertar nueva wallet
INSERT INTO WalletSaldos (WalletSaldoId, TokenColaborador, SaldoActual) VALUES
(4, 'e5625472-d883-47a2-936a-961b274e5177', 0);

-- eliminar una wallet pr id 
DELETE FROM WalletSaldos WHERE WalletSaldoId = 4;


select * from WalletTransacciones;
SELECT * FROM WalletCategorias;
--agregar una categoria
INSERT INTO WalletCategorias (CategoriaId, Nombre, Descripcion) VALUES
(1, 'Categoria 1', 'Descripción de la Categoria 1');
SELECT * FROM WalletSaldos;
--agregar transaccion de la waletsaldo con tokencolaborador 3 
insert into WalletTransacciones (WalletSaldoId, TokenColaborador, CategoriaId, Cantidad, Descripcion, Fecha)
VALUES
(3, 'e5625472-d883-47a2-936a-961b274e5177', 1, 100, 'Compra de premio 1', '2023-01-01');
--eliminar una transaccion de la wallet
DELETE FROM WalletTransacciones WHERE TransaccionId = 2;
