SELECT CONSTRAINT_NAME INTO @fk_participantes_viaje
FROM information_schema.KEY_COLUMN_USAGE
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'participantes_viaje'
  AND COLUMN_NAME = 'viaje_id'
  AND REFERENCED_TABLE_NAME = 'viajes'
LIMIT 1;
SET @sql = CONCAT(
    'ALTER TABLE participantes_viaje DROP FOREIGN KEY `',
    @fk_participantes_viaje,
    '`'
);
PREPARE statement FROM @sql;
EXECUTE statement;
DEALLOCATE PREPARE statement;
ALTER TABLE participantes_viaje
    ADD CONSTRAINT fk_participantes_viaje
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE;

SELECT CONSTRAINT_NAME INTO @fk_gastos_viaje
FROM information_schema.KEY_COLUMN_USAGE
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'gastos'
  AND COLUMN_NAME = 'viaje_id'
  AND REFERENCED_TABLE_NAME = 'viajes'
LIMIT 1;
SET @sql = CONCAT(
    'ALTER TABLE gastos DROP FOREIGN KEY `',
    @fk_gastos_viaje,
    '`'
);
PREPARE statement FROM @sql;
EXECUTE statement;
DEALLOCATE PREPARE statement;
ALTER TABLE gastos
    ADD CONSTRAINT fk_gastos_viaje
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE;

SELECT CONSTRAINT_NAME INTO @fk_actividades_viaje
FROM information_schema.KEY_COLUMN_USAGE
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'actividades_itinerario'
  AND COLUMN_NAME = 'viaje_id'
  AND REFERENCED_TABLE_NAME = 'viajes'
LIMIT 1;
SET @sql = CONCAT(
    'ALTER TABLE actividades_itinerario DROP FOREIGN KEY `',
    @fk_actividades_viaje,
    '`'
);
PREPARE statement FROM @sql;
EXECUTE statement;
DEALLOCATE PREPARE statement;
ALTER TABLE actividades_itinerario
    ADD CONSTRAINT fk_actividades_viaje
    FOREIGN KEY (viaje_id) REFERENCES viajes (id) ON DELETE CASCADE;
