CREATE TABLE roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uk_roles_nombre UNIQUE (nombre)
) ENGINE = InnoDB;

CREATE TABLE usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    rol_id BIGINT NOT NULL,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_correo UNIQUE (correo),
    CONSTRAINT fk_usuarios_roles
        FOREIGN KEY (rol_id)
        REFERENCES roles (id)
) ENGINE = InnoDB;

CREATE TABLE viajes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    origen VARCHAR(150) NOT NULL,
    destino VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    presupuesto_estimado DECIMAL(12, 2),
    transporte VARCHAR(50),
    estado VARCHAR(30) NOT NULL DEFAULT 'PLANIFICACION',
    organizador_id BIGINT NOT NULL,
    publico BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT fk_viajes_organizador
        FOREIGN KEY (organizador_id)
        REFERENCES usuarios (id)
) ENGINE = InnoDB;

CREATE TABLE participantes_viaje (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    viaje_id BIGINT NOT NULL,
    estado_invitacion VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    permiso_colaborar BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_incorporacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT uk_participante_usuario_viaje
        UNIQUE (usuario_id, viaje_id),
    CONSTRAINT fk_participantes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id),
    CONSTRAINT fk_participantes_viaje
        FOREIGN KEY (viaje_id)
        REFERENCES viajes (id)
) ENGINE = InnoDB;

CREATE TABLE gastos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    viaje_id BIGINT NOT NULL,
    usuario_pagador_id BIGINT NOT NULL,
    concepto VARCHAR(150) NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    categoria VARCHAR(30) NOT NULL DEFAULT 'OTRO',
    fecha DATE NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT fk_gastos_viaje
        FOREIGN KEY (viaje_id)
        REFERENCES viajes (id),
    CONSTRAINT fk_gastos_usuario_pagador
        FOREIGN KEY (usuario_pagador_id)
        REFERENCES usuarios (id)
) ENGINE = InnoDB;

CREATE TABLE actividades_itinerario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    viaje_id BIGINT NOT NULL,
    lugar VARCHAR(150) NOT NULL,
    horario DATETIME(6) NOT NULL,
    descripcion TEXT,
    responsable_id BIGINT NOT NULL,
    costo_estimado DECIMAL(12, 2),
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',

    PRIMARY KEY (id),
    CONSTRAINT fk_actividades_viaje
        FOREIGN KEY (viaje_id)
        REFERENCES viajes (id),
    CONSTRAINT fk_actividades_responsable
        FOREIGN KEY (responsable_id)
        REFERENCES usuarios (id)
) ENGINE = InnoDB;