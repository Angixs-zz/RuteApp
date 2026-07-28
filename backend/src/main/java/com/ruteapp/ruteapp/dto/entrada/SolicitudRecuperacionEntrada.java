package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SolicitudRecuperacionEntrada {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    private String correo;

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }
}
