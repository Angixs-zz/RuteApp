-- Datos iniciales de prueba para RuteApp
-- Contraseña de todos los usuarios: Prueba123!

INSERT INTO roles (nombre) VALUES
    ('ADMINISTRADOR'),
    ('USUARIO'),
    ('AGENCIA');

INSERT INTO usuarios (nombre, correo, password, avatar, activo, rol_id) VALUES
    (
        'Administrador RuteApp',
        'admin@ruteapp.com',
        '$2y$10$FE/nT4hGQodNcQ02BpYoUOaXyfAOUXV0.OvWyufwW/MRwD496V3qS',
        NULL,
        TRUE,
        (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR')
    ),
    (
        'Usuario de Prueba',
        'usuario@ruteapp.com',
        '$2y$10$FE/nT4hGQodNcQ02BpYoUOaXyfAOUXV0.OvWyufwW/MRwD496V3qS',
        NULL,
        TRUE,
        (SELECT id FROM roles WHERE nombre = 'USUARIO')
    ),
    (
        'Agencia RuteApp',
        'agencia@ruteapp.com',
        '$2y$10$FE/nT4hGQodNcQ02BpYoUOaXyfAOUXV0.OvWyufwW/MRwD496V3qS',
        NULL,
        TRUE,
        (SELECT id FROM roles WHERE nombre = 'AGENCIA')
    ),
    (
        'Yareli Participante',
        'yareli@ruteapp.com',
        '$2y$10$FE/nT4hGQodNcQ02BpYoUOaXyfAOUXV0.OvWyufwW/MRwD496V3qS',
        NULL,
        TRUE,
        (SELECT id FROM roles WHERE nombre = 'USUARIO')
    );

INSERT INTO viajes (
    nombre,
    descripcion,
    origen,
    destino,
    fecha_inicio,
    fecha_fin,
    presupuesto_estimado,
    transporte,
    estado,
    organizador_id,
    publico
) VALUES
    (
        'Fin de semana en Guadalajara',
        'Viaje grupal para visitar el centro histórico, museos y sitios turísticos.',
        'Ciudad de México',
        'Guadalajara, Jalisco',
        '2026-08-14',
        '2026-08-17',
        12500.00,
        'AUTOBUS',
        'PLANIFICACION',
        (SELECT id FROM usuarios WHERE correo = 'agencia@ruteapp.com'),
        TRUE
    ),
    (
        'Escapada a Puebla',
        'Salida de un día para recorrer el centro de Puebla y probar comida típica.',
        'Ciudad de México',
        'Puebla, Puebla',
        '2026-08-22',
        '2026-08-22',
        4500.00,
        'AUTO',
        'PLANIFICACION',
        (SELECT id FROM usuarios WHERE correo = 'usuario@ruteapp.com'),
        FALSE
    );

INSERT INTO participantes_viaje (
    usuario_id,
    viaje_id,
    estado_invitacion,
    permiso_colaborar
) VALUES
    (
        (SELECT id FROM usuarios WHERE correo = 'usuario@ruteapp.com'),
        (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Guadalajara'),
        'ACEPTADA',
        TRUE
    ),
    (
        (SELECT id FROM usuarios WHERE correo = 'yareli@ruteapp.com'),
        (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Guadalajara'),
        'PENDIENTE',
        FALSE
    ),
    (
        (SELECT id FROM usuarios WHERE correo = 'yareli@ruteapp.com'),
        (SELECT id FROM viajes WHERE nombre = 'Escapada a Puebla'),
        'ACEPTADA',
        TRUE
    );

INSERT INTO actividades_itinerario (
    viaje_id,
    lugar,
    horario,
    descripcion,
    responsable_id,
    costo_estimado,
    estado
) VALUES
    (
        (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Guadalajara'),
        'Centro Histórico de Guadalajara',
        '2026-08-15 10:00:00',
        'Recorrido por la catedral, plazas y edificios históricos.',
        (SELECT id FROM usuarios WHERE correo = 'agencia@ruteapp.com'),
        500.00,
        'PENDIENTE'
    ),
    (
        (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Guadalajara'),
        'Hospicio Cabañas',
        '2026-08-15 16:00:00',
        'Visita cultural y recorrido por el museo.',
        (SELECT id FROM usuarios WHERE correo = 'usuario@ruteapp.com'),
        320.00,
        'PENDIENTE'
    ),
    (
        (SELECT id FROM viajes WHERE nombre = 'Escapada a Puebla'),
        'Zócalo de Puebla',
        '2026-08-22 11:00:00',
        'Paseo por el centro y comida grupal.',
        (SELECT id FROM usuarios WHERE correo = 'usuario@ruteapp.com'),
        900.00,
        'PENDIENTE'
    );

INSERT INTO gastos (
    viaje_id,
    usuario_pagador_id,
    concepto,
    monto,
    categoria,
    fecha
) VALUES
    (
        (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Guadalajara'),
        (SELECT id FROM usuarios WHERE correo = 'agencia@ruteapp.com'),
        'Anticipo de hospedaje',
        3500.00,
        'HOSPEDAJE',
        '2026-07-26'
    ),
    (
        (SELECT id FROM viajes WHERE nombre = 'Fin de semana en Guadalajara'),
        (SELECT id FROM usuarios WHERE correo = 'usuario@ruteapp.com'),
        'Boletos de autobús',
        2400.00,
        'TRANSPORTE',
        '2026-07-26'
    ),
    (
        (SELECT id FROM viajes WHERE nombre = 'Escapada a Puebla'),
        (SELECT id FROM usuarios WHERE correo = 'usuario@ruteapp.com'),
        'Gasolina',
        850.00,
        'TRANSPORTE',
        '2026-07-26'
    );
