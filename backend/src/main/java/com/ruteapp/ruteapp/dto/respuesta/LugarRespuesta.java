package com.ruteapp.ruteapp.dto.respuesta;

import java.math.BigDecimal;

public record LugarRespuesta(
        Long id,
        String placeId,
        String nombre,
        String direccionFormateada,
        String ciudad,
        String estado,
        String pais,
        BigDecimal latitud,
        BigDecimal longitud
) {
}
