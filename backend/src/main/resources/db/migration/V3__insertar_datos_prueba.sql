-- Migración V3: Insertar datos de prueba para desarrollo
-- Contraseña plana común para todos los usuarios de prueba: Prueba123!

-- 1. ROLES (3 roles: ADMINISTRADOR, USUARIO, AGENCIA)
INSERT IGNORE INTO roles (nombre) VALUES
('ADMINISTRADOR'),
('USUARIO'),
('AGENCIA');

-- 2. USUARIOS (6 usuarios: 1 Admin, 3 Usuarios, 2 Agencias)
INSERT IGNORE INTO usuarios (nombre, correo, password, activo, rol_id, fecha_creacion)
VALUES
('Administrador Principal', 'admin@ruteapp.com', '$2a$10$n74y1cTaZAfwZq7EsR7IweVhl.0QN98yzGWpvZNrdGWrcPWniOsgq', TRUE, (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR'), NOW(6)),
('Carlos Mendoza', 'usuario1@ruteapp.com', '$2a$10$n74y1cTaZAfwZq7EsR7IweVhl.0QN98yzGWpvZNrdGWrcPWniOsgq', TRUE, (SELECT id FROM roles WHERE nombre = 'USUARIO'), NOW(6)),
('Ana García', 'usuario2@ruteapp.com', '$2a$10$n74y1cTaZAfwZq7EsR7IweVhl.0QN98yzGWpvZNrdGWrcPWniOsgq', TRUE, (SELECT id FROM roles WHERE nombre = 'USUARIO'), NOW(6)),
('Luis Hernández', 'usuario3@ruteapp.com', '$2a$10$n74y1cTaZAfwZq7EsR7IweVhl.0QN98yzGWpvZNrdGWrcPWniOsgq', TRUE, (SELECT id FROM roles WHERE nombre = 'USUARIO'), NOW(6)),
('Agencia Viajes Express', 'agencia1@ruteapp.com', '$2a$10$n74y1cTaZAfwZq7EsR7IweVhl.0QN98yzGWpvZNrdGWrcPWniOsgq', TRUE, (SELECT id FROM roles WHERE nombre = 'AGENCIA'), NOW(6)),
('EcoTour Aventuras', 'agencia2@ruteapp.com', '$2a$10$n74y1cTaZAfwZq7EsR7IweVhl.0QN98yzGWpvZNrdGWrcPWniOsgq', TRUE, (SELECT id FROM roles WHERE nombre = 'AGENCIA'), NOW(6));

-- 3. LUGARES (4 lugares)
INSERT IGNORE INTO lugares (place_id, nombre, direccion_formateada, ciudad, estado, pais, latitud, longitud, fecha_creacion)
VALUES
('seed-puebla', 'Puebla de Zaragoza', 'Puebla de Zaragoza, PUE, México', 'Puebla de Zaragoza', 'Puebla', 'México', 19.0437196, -98.1981486, NOW(6)),
('seed-puerto-vallarta', 'Puerto Vallarta', 'Puerto Vallarta, JAL, México', 'Puerto Vallarta', 'Jalisco', 'México', 20.6407176, -105.2203060, NOW(6)),
('seed-oaxaca', 'Oaxaca de Juárez', 'Oaxaca de Juárez, OAX, México', 'Oaxaca de Juárez', 'Oaxaca', 'México', 17.0731842, -96.7266483, NOW(6)),
('seed-cdmx', 'Ciudad de México', 'Ciudad de México, CDMX, México', 'Ciudad de México', 'Ciudad de México', 'México', 19.4326077, -99.1332080, NOW(6));

-- 4. VIAJES (4 viajes)
INSERT INTO viajes (nombre, descripcion, origen, destino, fecha_inicio, fecha_fin, presupuesto_estimado, transporte, estado, organizador_id, publico, fecha_creacion, origen_lugar_id, destino_lugar_id)
SELECT 'Viaje a Puerto Vallarta', 'Vacaciones de verano en la playa con amigos', 'Puebla de Zaragoza', 'Puerto Vallarta', '2026-08-10', '2026-08-17', 15000.00, 'Avión', 'PLANIFICACION', (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), TRUE, NOW(6), (SELECT id FROM lugares WHERE place_id = 'seed-puebla'), (SELECT id FROM lugares WHERE place_id = 'seed-puerto-vallarta')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' AND organizador_id = (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'));

INSERT INTO viajes (nombre, descripcion, origen, destino, fecha_inicio, fecha_fin, presupuesto_estimado, transporte, estado, organizador_id, publico, fecha_creacion, origen_lugar_id, destino_lugar_id)
SELECT 'Fin de semana en Oaxaca', 'Escapada cultural y gastronómica a Oaxaca de Juárez', 'Ciudad de México', 'Oaxaca de Juárez', '2026-09-04', '2026-09-06', 8000.00, 'Autobús', 'EN_CURSO', (SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'), TRUE, NOW(6), (SELECT id FROM lugares WHERE place_id = 'seed-cdmx'), (SELECT id FROM lugares WHERE place_id = 'seed-oaxaca')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' AND organizador_id = (SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'));

INSERT INTO viajes (nombre, descripcion, origen, destino, fecha_inicio, fecha_fin, presupuesto_estimado, transporte, estado, organizador_id, publico, fecha_creacion, origen_lugar_id, destino_lugar_id)
SELECT 'Ruta gastronómica en Puebla', 'Tour exclusivo por los mejores restaurantes y lugares icónicos de Puebla', 'Ciudad de México', 'Puebla de Zaragoza', '2026-06-15', '2026-06-18', 6000.00, 'Automóvil', 'FINALIZADO', (SELECT id FROM usuarios WHERE correo = 'agencia1@ruteapp.com'), TRUE, NOW(6), (SELECT id FROM lugares WHERE place_id = 'seed-cdmx'), (SELECT id FROM lugares WHERE place_id = 'seed-puebla')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' AND organizador_id = (SELECT id FROM usuarios WHERE correo = 'agencia1@ruteapp.com'));

INSERT INTO viajes (nombre, descripcion, origen, destino, fecha_inicio, fecha_fin, presupuesto_estimado, transporte, estado, organizador_id, publico, fecha_creacion, origen_lugar_id, destino_lugar_id)
SELECT 'Vacaciones en CDMX', 'Recorrido por los principales museos y parques de la CDMX', 'Puerto Vallarta', 'Ciudad de México', '2026-10-01', '2026-10-05', 12000.00, 'Avión', 'CANCELADO', (SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), FALSE, NOW(6), (SELECT id FROM lugares WHERE place_id = 'seed-puerto-vallarta'), (SELECT id FROM lugares WHERE place_id = 'seed-cdmx')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM viajes WHERE nombre = 'Vacaciones en CDMX' AND organizador_id = (SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'));

-- 5. PARTICIPANTES (8 participantes)
INSERT IGNORE INTO participantes_viaje (usuario_id, viaje_id, estado_invitacion, permiso_colaborar, fecha_incorporacion)
VALUES
((SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1), 'ACEPTADA', TRUE, NOW(6)),
((SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1), 'ACEPTADA', FALSE, NOW(6)),
((SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1), 'ACEPTADA', TRUE, NOW(6)),
((SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1), 'PENDIENTE', FALSE, NOW(6)),
((SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1), 'ACEPTADA', TRUE, NOW(6)),
((SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1), 'ACEPTADA', TRUE, NOW(6)),
((SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1), 'ACEPTADA', FALSE, NOW(6)),
((SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1), 'RECHAZADA', FALSE, NOW(6));

-- 6. ACTIVIDADES (8 actividades)
INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1), 'Recorrido por el malecón', '2026-08-11 18:00:00.000000', 'Caminata y atardecer en el malecón de Puerto Vallarta', (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), 0.00, 'PENDIENTE', (SELECT id FROM lugares WHERE place_id = 'seed-puerto-vallarta')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Recorrido por el malecón' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1));

INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1), 'Cena grupal en la playa', '2026-08-12 21:00:00.000000', 'Cena en restaurante frente al mar', (SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'), 1500.00, 'PENDIENTE', (SELECT id FROM lugares WHERE place_id = 'seed-puerto-vallarta')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Cena grupal en la playa' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1));

INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1), 'Visita al centro histórico', '2026-09-05 10:00:00.000000', 'Tour guiado por el Zócalo y Santo Domingo', (SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'), 300.00, 'PENDIENTE', (SELECT id FROM lugares WHERE place_id = 'seed-oaxaca')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Visita al centro histórico' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1));

INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1), 'Tour gastronómico', '2026-09-05 14:00:00.000000', 'Degustación de tlayudas y mole oaxaqueño en el mercado', (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), 800.00, 'PENDIENTE', (SELECT id FROM lugares WHERE place_id = 'seed-oaxaca')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Tour gastronómico' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1));

INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1), 'Ruta de los azulejos y mole', '2026-06-16 12:00:00.000000', 'Visita a la Casa de los Muñecos y comida típica', (SELECT id FROM usuarios WHERE correo = 'agencia1@ruteapp.com'), 1200.00, 'COMPLETADA', (SELECT id FROM lugares WHERE place_id = 'seed-puebla')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Ruta de los azulejos y mole' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1));

INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1), 'Visita a museo', '2026-06-17 11:00:00.000000', 'Recorrido por el Museo Amparo', (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), 250.00, 'COMPLETADA', (SELECT id FROM lugares WHERE place_id = 'seed-puebla')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Visita a museo' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1));

INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1), 'Punto de encuentro en el Ángel', '2026-10-02 09:00:00.000000', 'Reunión inicial del grupo en Reforma', (SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), 0.00, 'CANCELADA', (SELECT id FROM lugares WHERE place_id = 'seed-cdmx')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Punto de encuentro en el Ángel' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1));

INSERT INTO actividades_itinerario (viaje_id, lugar, horario, descripcion, responsable_id, costo_estimado, estado, lugar_id)
SELECT (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1), 'Regreso al hotel', '2026-10-04 20:00:00.000000', 'Traslado de regreso desde Bellas Artes', (SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), 200.00, 'CANCELADA', (SELECT id FROM lugares WHERE place_id = 'seed-cdmx')
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM actividades_itinerario WHERE lugar = 'Regreso al hotel' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1));

-- 7. GASTOS (8 gastos)
INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), 'Boletos de avión ida y vuelta', 4500.00, 'TRANSPORTE', '2026-08-01'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Boletos de avión ida y vuelta' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1));

INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), 'Reserva de hotel resort', 6000.00, 'HOSPEDAJE', '2026-08-02'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Reserva de hotel resort' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Viaje a Puerto Vallarta' LIMIT 1));

INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'), 'Boletos de autobús CDMX-Oaxaca', 1200.00, 'TRANSPORTE', '2026-09-01'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Boletos de autobús CDMX-Oaxaca' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1));

INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'usuario2@ruteapp.com'), 'Hospedaje hotel en Oaxaca', 2500.00, 'HOSPEDAJE', '2026-09-02'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Hospedaje hotel en Oaxaca' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Oaxaca' LIMIT 1));

INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'agencia1@ruteapp.com'), 'Paquete tour gastronómico', 1800.00, 'COMIDA', '2026-06-10'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Paquete tour gastronómico' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1));

INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'usuario1@ruteapp.com'), 'Entradas a Museo Amparo', 350.00, 'ENTRETENIMIENTO', '2026-06-17'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Entradas a Museo Amparo' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Ruta gastronómica en Puebla' LIMIT 1));

INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), 'Anticipo reserva hotel CDMX', 3200.00, 'HOSPEDAJE', '2026-09-25'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Anticipo reserva hotel CDMX' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1));

INSERT INTO gastos (viaje_id, usuario_pagador_id, concepto, monto, categoria, fecha)
SELECT (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1), (SELECT id FROM usuarios WHERE correo = 'usuario3@ruteapp.com'), 'Taxi al aeropuerto', 450.00, 'TRANSPORTE', '2026-10-01'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM gastos WHERE concepto = 'Taxi al aeropuerto' AND viaje_id = (SELECT id FROM viajes WHERE nombre = 'Vacaciones en CDMX' LIMIT 1));
