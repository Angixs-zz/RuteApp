CREATE TABLE tokens_recuperacion_password (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    fecha_expiracion DATETIME(6) NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT uk_tokens_recuperacion_hash UNIQUE (token_hash),
    CONSTRAINT fk_tokens_recuperacion_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id)
        ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_tokens_recuperacion_usuario
    ON tokens_recuperacion_password (usuario_id);

CREATE INDEX idx_tokens_recuperacion_expiracion
    ON tokens_recuperacion_password (fecha_expiracion);
