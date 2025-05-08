-- Insertar datos en organizaciones
INSERT INTO "Organizaciones" ("Nombre", "DominioEmail", "Descripcion", "Activa") VALUES
('UDLA', 'udla.edu.ec', 'Universidad de Las Americas', true),
('ULatina', 'ulatina.cr', 'Universidad Latina de Costa Rica', true);

-- Insertar datos en comportamientos
-- Para UDLA (referenciada por el dominio de email)
INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Inclusión/Humanismo', 'Toma en cuenta las sugerencias y experiencias de los demás, manteniendo una actitud abierta a aprender de otros y fomentando un ambiente de confianza y colaboración.', 2
FROM "Organizaciones" o WHERE o."DominioEmail" = 'udla.edu.ec';

INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Inclusión/Humanismo', 'Reconoce y valida las emociones de los demás, identificando las fortalezas y habilidades de cada uno para el logro de los objetivos comunes.', 4
FROM "Organizaciones" o WHERE o."DominioEmail" = 'udla.edu.ec';

INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Resiliencia', 'Se muestra seguro de sí mismo y supera cualquier obstáculo para alcanzar sus objetivos.', 2
FROM "Organizaciones" o WHERE o."DominioEmail" = 'udla.edu.ec';

INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Resiliencia', 'Brinda soluciones efectivas a los problemas que se le presentan, demostrando capacidad para superar obstáculos y adaptarse a las circunstancias.', 4
FROM "Organizaciones" o WHERE o."DominioEmail" = 'udla.edu.ec';

-- Para ULatina (referenciada por el dominio de email)
INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Respeto', 'Sabe escuchar y es receptivo a las opiniones de los demás mostrando interés genuino a las solicitudes, asegurando un servicio respetuoso y efectivo.', 4
FROM "Organizaciones" o WHERE o."DominioEmail" = 'ulatina.cr';

INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Respeto', 'Se dirige a todos con amabilidad, mostrando interés en sus ideas y perspectivas.', 2
FROM "Organizaciones" o WHERE o."DominioEmail" = 'ulatina.cr';

INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Integridad', 'Reconoce los errores cometidos, aprende de ellos y los rectifica, promoviendo la transparencia en sus acciones.', 2
FROM "Organizaciones" o WHERE o."DominioEmail" = 'ulatina.cr';

INSERT INTO "Comportamientos" ("OrganizacionId", "Nombre", "Descripcion", "WalletOtorgados") 
SELECT o."OrganizacionId", 'Integridad', 'Piensa y actúa de manera consciente, sin afectar los intereses de los demás, incluso cuando nadie lo está observando.', 4
FROM "Organizaciones" o WHERE o."DominioEmail" = 'ulatina.cr';

-- Insertar datos en categorias (asegurándose que no existan previamente)
INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Artículos', 'Artículos diversos' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Artículos');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Experiencias', 'Experiencias y actividades' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Experiencias');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Deportes', 'Artículos y actividades deportivas' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Deportes');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Tecnología', 'Dispositivos y gadgets tecnológicos' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Tecnología');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'UDLA servicios', 'Servicios ofrecidos por UDLA' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'UDLA servicios');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Body', 'Servicios de cuidado personal' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Body');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Comida', 'Establecimientos y servicios de comida' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Comida');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Cursos externos', 'Cursos ofrecidos por entidades externas' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Cursos externos');

INSERT INTO "Categorias" ("Nombre", "Descripcion") 
SELECT 'Mascota', 'Productos y servicios para mascotas' 
WHERE NOT EXISTS (SELECT 1 FROM "Categorias" WHERE "Nombre" = 'Mascota');

-- Insertar datos en MarketplacePremios para UDLA
-- Extraer el OrganizacionId para UDLA
DO $$
DECLARE 
    org_id INTEGER;
    cat_id INTEGER;
BEGIN
    -- Obtener el ID de la organización UDLA
    SELECT "OrganizacionId" INTO org_id FROM "Organizaciones" WHERE "Nombre" = 'UDLA';
    
    -- Artículos
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Artículos';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Zapatos', 'Zapatos de calidad', 150, '/images/premios/zapatos.jpg', 10, CURRENT_TIMESTAMP);

    -- Experiencias
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Experiencias';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Tunas y Cabras (2 persona)/Polilepis', 'Experiencia para 2 personas', 135, '/images/premios/tunas.jpg', 5, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Pinta un pañuelo', 'Experiencia artística', 30, '/images/premios/panuelo.jpg', 15, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Papallacta', 'Visita a las termas', 20, '/images/premios/papallacta.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, '20 min entradas de Karting', 'Experiencia de velocidad', 20, '/images/premios/karting.jpg', 15, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, '2 Entradas al cine + combo de canguil y cola', 'Entretenimiento cinematográfico', 14, '/images/premios/cine.jpg', 25, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'COMBO cine', 'Combo de alimentos para el cine', 12, '/images/premios/combo.jpg', 30, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Aqua River Park', 'Entrada al parque acuático', 12, '/images/premios/aqua.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Entrada a Mr. Joy', 'Diversión garantizada', 10, '/images/premios/joy.jpg', 30, CURRENT_TIMESTAMP);
    
    -- Deportes
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Deportes';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'ICE CUBE', 'Accesorio deportivo', 115, '/images/premios/icecube.jpg', 5, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Bonos de gasolina', 'Para tus viajes y actividades', 40, '/images/premios/gasolina.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Tatto camp Towel', 'Toalla deportiva', 15, '/images/premios/toalla.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Entradas al estadio', 'Disfruta de un partido en vivo', 15, '/images/premios/estadio.jpg', 30, CURRENT_TIMESTAMP);
    
    -- Tecnología
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Tecnología';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Impresora para celular', 'Imprime tus fotos al instante', 80, '/images/premios/impresora.jpg', 8, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Cámara INSTASHOT', 'Captura momentos especiales', 80, '/images/premios/camara.jpg', 8, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Alexa', 'Asistente virtual inteligente', 60, '/images/premios/alexa.jpg', 10, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Audífonos JBL', 'Audio de alta calidad', 40, '/images/premios/audifonos.jpg', 15, CURRENT_TIMESTAMP);
    
    -- UDLA servicios
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'UDLA servicios';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Pago parqueadero de 1 año', 'Comodidad para estacionar', 80, '/images/premios/parqueadero.jpg', 10, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Chompa UDLA', 'Prenda oficial de la universidad', 25, '/images/premios/chompa.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Pago de inscripción en el Gimnasio UDLA', 'Mantente en forma', 15, '/images/premios/gimnasio.jpg', 30, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Canasta de bebé (insumos varios)', 'Para los pequeños de la familia', 15, '/images/premios/canasta.jpg', 15, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Ticket para lavado de auto', 'Mantén tu vehículo limpio', 6, '/images/premios/lavado.jpg', 50, CURRENT_TIMESTAMP);
    
    -- Body
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Body';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Diseño de cejas', 'Mejora tu imagen personal', 40, '/images/premios/cejas.jpg', 15, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Lifting', 'Tratamiento facial', 35, '/images/premios/lifting.jpg', 15, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'SPA- Masaje', 'Relájate y disfruta', 30, '/images/premios/masaje.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Limpieza facial', 'Cuida tu piel', 25, '/images/premios/limpieza.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Manicure', 'Manos impecables', 7, '/images/premios/manicure.jpg', 30, CURRENT_TIMESTAMP);
    
    -- Comida
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Comida';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Go Hotel pizza', 'Deliciosa pizza en el hotel', 30, '/images/premios/pizza.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Francachela 2 bebidas/postre', 'Disfruta de buenas bebidas', 25, '/images/premios/francachela.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Grupo Z (cocteles, premios)', 'Exquisitos cocteles', 20, '/images/premios/cocteles.jpg', 25, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Desayunos en Pacari', 'Inicio delicioso del día', 12, '/images/premios/pacari.jpg', 30, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, '2 cocteles/postre en Negroni', 'Experiencia gourmet', 10, '/images/premios/negroni.jpg', 30, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Desayuno en BAKERY', 'Delicias de panadería', 10, '/images/premios/bakery.jpg', 30, CURRENT_TIMESTAMP);
    
    -- Cursos externos
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Cursos externos';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Cursos de fotografía', 'Aprende el arte de la fotografía', 30, '/images/premios/fotografia.jpg', 15, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Curso de cerámica', 'Desarrolla tu creatividad', 30, '/images/premios/ceramica.jpg', 15, CURRENT_TIMESTAMP);
    
    -- Mascota
    SELECT "CategoriaId" INTO cat_id FROM "Categorias" WHERE "Nombre" = 'Mascota';
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'BUBBLES PET SPA', 'Consienta a su mascota', 25, '/images/premios/petspa.jpg', 20, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Correas para perro', 'Accesorios para mascotas', 15, '/images/premios/correa.jpg', 25, CURRENT_TIMESTAMP);
    
    INSERT INTO "MarketplacePremios" ("OrganizacionId", "CategoriaId", "Nombre", "Descripcion", "CostoWallet", "ImagenUrl", "CantidadActual", "UltimaActualizacion") 
    VALUES (org_id, cat_id, 'Mundo mágico (orden de consumo de $10,00)', 'Para el cuidado de tus mascotas', 10, '/images/premios/magico.jpg', 30, CURRENT_TIMESTAMP);
    
END $$;
