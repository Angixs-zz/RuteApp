ALTER TABLE usuarios
    MODIFY COLUMN password VARCHAR(255) NULL,
    ADD COLUMN google_subject VARCHAR(255) NULL AFTER password,
    ADD CONSTRAINT uk_usuarios_google_subject UNIQUE (google_subject);
