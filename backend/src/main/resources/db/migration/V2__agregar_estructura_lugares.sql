CREATE TABLE lugares (
    id BIGINT NOT NULL AUTO_INCREMENT,
    place_id VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    direccion_formateada VARCHAR(255) NOT NULL,
    ciudad VARCHAR(150),
    estado VARCHAR(150),
    pais VARCHAR(100) NOT NULL,
    latitud DECIMAL(10, 7) NOT NULL,
    longitud DECIMAL(10, 7) NOT NULL,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT uk_lugares_place_id UNIQUE (place_id)
) ENGINE = InnoDB;

ALTER TABLE viajes
    ADD COLUMN origen_lugar_id BIGINT NULL,
    ADD COLUMN destino_lugar_id BIGINT NULL;

ALTER TABLE actividades_itinerario
    ADD COLUMN lugar_id BIGINT NULL;

CREATE INDEX idx_viajes_origen_lugar
    ON viajes (origen_lugar_id);

CREATE INDEX idx_viajes_destino_lugar
    ON viajes (destino_lugar_id);

CREATE INDEX idx_actividades_lugar
    ON actividades_itinerario (lugar_id);

ALTER TABLE viajes
    ADD CONSTRAINT fk_viajes_origen_lugar
        FOREIGN KEY (origen_lugar_id)
        REFERENCES lugares (id),
    ADD CONSTRAINT fk_viajes_destino_lugar
        FOREIGN KEY (destino_lugar_id)
        REFERENCES lugares (id);

ALTER TABLE actividades_itinerario
    ADD CONSTRAINT fk_actividades_lugar
        FOREIGN KEY (lugar_id)
        REFERENCES lugares (id);
