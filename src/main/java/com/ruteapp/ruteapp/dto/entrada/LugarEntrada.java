package com.ruteapp.ruteapp.dto.entrada;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LugarEntrada {

    @NotBlank(message = "El identificador externo del lugar es obligatorio")
    private String placeId;

    @NotBlank(message = "El nombre del lugar es obligatorio")
    private String nombre;

    @NotBlank(message = "La dirección formateada es obligatoria")
    private String direccionFormateada;

    private String ciudad;
    private String estado;

    @NotBlank(message = "El país es obligatorio")
    private String pais;

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90.0", message = "La latitud mínima es -90")
    @DecimalMax(value = "90.0", message = "La latitud máxima es 90")
    private BigDecimal latitud;

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180.0", message = "La longitud mínima es -180")
    @DecimalMax(value = "180.0", message = "La longitud máxima es 180")
    private BigDecimal longitud;
}
