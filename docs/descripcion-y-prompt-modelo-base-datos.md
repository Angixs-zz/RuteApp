# Modelo de base de datos de RuteApp

## Propósito del modelo

RuteApp necesita almacenar la información de usuarios, roles, viajes, participantes, lugares, actividades y gastos. El modelo está diseñado para MySQL 8 y utiliza claves foráneas para conservar la integridad de la información.

La base contiene siete tablas relacionadas:

1. `roles`: catálogo de niveles de acceso disponibles.
2. `usuarios`: personas registradas en la aplicación. Cada usuario tiene un rol.
3. `lugares`: ubicaciones obtenidas mediante Geoapify y reutilizadas como origen, destino o ubicación de una actividad.
4. `viajes`: información principal de cada viaje y el usuario que lo organiza.
5. `participantes_viaje`: entidad asociativa entre usuarios y viajes. Resuelve la relación muchos a muchos y almacena datos adicionales sobre la participación.
6. `gastos`: movimientos económicos registrados dentro de un viaje y el usuario que realizó el pago.
7. `actividades_itinerario`: actividades programadas dentro de un viaje, su responsable y su lugar de referencia.

## Relaciones y cardinalidades

- Un rol puede estar asignado a muchos usuarios, pero cada usuario tiene un solo rol: `roles 1:N usuarios`.
- Un usuario puede organizar muchos viajes, pero cada viaje tiene un solo organizador: `usuarios 1:N viajes`.
- Un usuario puede participar en muchos viajes y un viaje puede incluir muchos usuarios: `usuarios N:M viajes`. La relación se resuelve con `participantes_viaje`.
- Un viaje puede tener muchos gastos, pero cada gasto pertenece a un solo viaje: `viajes 1:N gastos`.
- Un usuario puede pagar muchos gastos, pero cada gasto tiene un solo pagador: `usuarios 1:N gastos`.
- Un viaje puede tener muchas actividades, pero cada actividad pertenece a un solo viaje: `viajes 1:N actividades_itinerario`.
- Un usuario puede ser responsable de muchas actividades, pero cada actividad tiene un solo responsable: `usuarios 1:N actividades_itinerario`.
- Un lugar puede utilizarse como origen o destino de muchos viajes. El origen y destino textual se conserva además de la referencia porque la integración externa puede no estar disponible.
- Un lugar puede relacionarse con muchas actividades y la referencia es opcional.

## Reglas importantes

- Los correos de los usuarios son únicos.
- Los nombres de los roles son únicos.
- El `place_id` de Geoapify es único.
- Un usuario no puede aparecer dos veces como participante del mismo viaje. Esto se garantiza con una restricción única compuesta por `usuario_id` y `viaje_id`.
- Todas las claves primarias son `BIGINT`, autoincrementales y no nulas.
- Los importes utilizan `DECIMAL(12,2)` para evitar errores de precisión monetaria.
- Las contraseñas ocupan hasta 255 caracteres porque almacenan hashes BCrypt, nunca texto plano.
- Los valores de estado se guardan como texto para coincidir con los enums utilizados por Spring Boot.
- Los estados válidos de un viaje son `PLANIFICACION`, `EN_CURSO`, `FINALIZADO` y `CANCELADO`.
- Los estados válidos de una invitación son `PENDIENTE`, `ACEPTADA` y `RECHAZADA`.
- Las categorías de gasto son `TRANSPORTE`, `HOSPEDAJE`, `COMIDA`, `ENTRETENIMIENTO` y `OTRO`.

## Generar el diagrama en MySQL Workbench

El archivo `modelo-base-datos-workbench.sql` crea una base documental llamada `ruteapp_modelo`, separada de la base utilizada por la aplicación.

1. Abrir MySQL Workbench y conectarse a una instancia local de MySQL 8.
2. Seleccionar `File > Open SQL Script`.
3. Abrir `docs/modelo-base-datos-workbench.sql`.
4. Ejecutar todo el script con el icono del rayo.
5. Seleccionar `Database > Reverse Engineer`.
6. Elegir la conexión y seleccionar el esquema `ruteapp_modelo`.
7. Continuar hasta que Workbench cree el modelo EER.
8. Utilizar `Arrange > Autolayout` para ordenar las tablas automáticamente.
9. Exportar el resultado desde `File > Export > Export as PNG` o `Export as PDF`.

El script es una ayuda para producir el diagrama. Las migraciones ubicadas en `backend/src/main/resources/db/migration/` continúan siendo la fuente oficial de la estructura de la aplicación.

## Prompt detallado para otra inteligencia artificial

```text
Genera un diagrama Entidad-Relación profesional y legible para una aplicación web llamada RuteApp, desarrollada para organizar viajes colaborativos. Usa notación pata de cuervo y muestra claramente las claves primarias (PK), claves foráneas (FK), restricciones únicas (UK), campos obligatorios y campos opcionales. El motor de base de datos es MySQL 8.

El modelo debe contener las siguientes siete entidades:

1. roles:
- id BIGINT, PK, autoincremental, obligatorio.
- nombre VARCHAR(30), obligatorio y único.

2. usuarios:
- id BIGINT, PK, autoincremental, obligatorio.
- nombre VARCHAR(100), obligatorio.
- correo VARCHAR(150), obligatorio y único; se utiliza para iniciar sesión.
- password VARCHAR(255), obligatorio; almacena un hash BCrypt, nunca texto plano.
- avatar VARCHAR(255), opcional.
- activo BOOLEAN, obligatorio, valor inicial verdadero.
- rol_id BIGINT, FK obligatoria hacia roles.id.
- fecha_creacion DATETIME(6), obligatoria.

3. lugares:
- id BIGINT, PK, autoincremental, obligatorio.
- place_id VARCHAR(255), obligatorio y único; corresponde al identificador externo de Geoapify.
- nombre VARCHAR(150), obligatorio.
- direccion_formateada VARCHAR(255), obligatoria.
- ciudad VARCHAR(150), opcional.
- estado VARCHAR(150), opcional.
- pais VARCHAR(100), obligatorio.
- latitud DECIMAL(10,7), obligatoria.
- longitud DECIMAL(10,7), obligatoria.
- fecha_creacion DATETIME(6), obligatoria.

4. viajes:
- id BIGINT, PK, autoincremental, obligatorio.
- nombre VARCHAR(150), obligatorio.
- descripcion TEXT, opcional.
- origen VARCHAR(150), obligatorio.
- destino VARCHAR(150), obligatorio.
- fecha_inicio DATE, obligatoria.
- fecha_fin DATE, obligatoria.
- presupuesto_estimado DECIMAL(12,2), opcional.
- transporte VARCHAR(50), opcional.
- estado VARCHAR(30), obligatorio; valores posibles PLANIFICACION, EN_CURSO, FINALIZADO y CANCELADO.
- organizador_id BIGINT, FK obligatoria hacia usuarios.id.
- publico BOOLEAN, obligatorio, valor inicial falso.
- fecha_creacion DATETIME(6), obligatoria.
- origen_lugar_id BIGINT, FK opcional hacia lugares.id.
- destino_lugar_id BIGINT, FK opcional hacia lugares.id.

5. participantes_viaje:
- id BIGINT, PK, autoincremental, obligatorio.
- usuario_id BIGINT, FK obligatoria hacia usuarios.id.
- viaje_id BIGINT, FK obligatoria hacia viajes.id.
- estado_invitacion VARCHAR(30), obligatorio; valores PENDIENTE, ACEPTADA y RECHAZADA.
- permiso_colaborar BOOLEAN, obligatorio, valor inicial falso.
- fecha_incorporacion DATETIME(6), obligatoria.
- Agrega una restricción única compuesta por usuario_id y viaje_id.
- Explica visualmente que esta entidad resuelve la relación N:M entre usuarios y viajes y además contiene atributos propios de la participación.

6. gastos:
- id BIGINT, PK, autoincremental, obligatorio.
- viaje_id BIGINT, FK obligatoria hacia viajes.id.
- usuario_pagador_id BIGINT, FK obligatoria hacia usuarios.id.
- concepto VARCHAR(150), obligatorio.
- monto DECIMAL(12,2), obligatorio.
- categoria VARCHAR(30), obligatoria; valores TRANSPORTE, HOSPEDAJE, COMIDA, ENTRETENIMIENTO y OTRO.
- fecha DATE, obligatoria.

7. actividades_itinerario:
- id BIGINT, PK, autoincremental, obligatorio.
- viaje_id BIGINT, FK obligatoria hacia viajes.id.
- lugar VARCHAR(150), obligatorio.
- horario DATETIME(6), obligatorio.
- descripcion TEXT, opcional.
- responsable_id BIGINT, FK obligatoria hacia usuarios.id.
- costo_estimado DECIMAL(12,2), opcional.
- estado VARCHAR(30), obligatorio, valor inicial PENDIENTE.
- lugar_id BIGINT, FK opcional hacia lugares.id.

Representa estas cardinalidades:
- roles 1:N usuarios.
- usuarios 1:N viajes por organizador_id.
- usuarios N:M viajes mediante participantes_viaje.
- viajes 1:N gastos.
- usuarios 1:N gastos por usuario_pagador_id.
- viajes 1:N actividades_itinerario.
- usuarios 1:N actividades_itinerario por responsable_id.
- lugares 1:N viajes mediante origen_lugar_id.
- lugares 1:N viajes mediante destino_lugar_id.
- lugares 1:N actividades_itinerario mediante lugar_id.

Organiza el diagrama para evitar líneas cruzadas. Coloca viajes en el centro, usuarios y roles a la izquierda, participantes_viaje entre usuarios y viajes, lugares en la parte superior, y gastos y actividades_itinerario a la derecha. Incluye una pequeña leyenda que explique PK, FK, UK, 1:N y N:M. No agregues tablas ni campos que no estén indicados. Entrega también una explicación breve de cómo la estructura apoya la organización colaborativa de viajes.
```
