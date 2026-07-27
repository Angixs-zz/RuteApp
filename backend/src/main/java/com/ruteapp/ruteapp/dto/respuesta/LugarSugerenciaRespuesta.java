package com.ruteapp.ruteapp.dto.respuesta;

public record LugarSugerenciaRespuesta(
        String placeId,
        String nombre,
        String direccionFormateada,
        String ciudad,
        String estado,
        String pais,
        Double latitud,
        Double longitud
) {
}
