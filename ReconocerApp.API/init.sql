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
