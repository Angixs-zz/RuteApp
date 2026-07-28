package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RespuestaInvitacionEntrada {

    @NotBlank(message = "La respuesta es obligatoria")
    @Pattern(
            regexp = "^(ACEPTADA|RECHAZADA)$",
            message = "La respuesta debe ser ACEPTADA o RECHAZADA"
    )
    private String respuesta;

    public String getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(String respuesta) {
        this.respuesta = respuesta;
    }
}
