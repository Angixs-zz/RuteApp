package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class WhatsAppEntrada {

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(
            regexp = "^(?:\\+?52)?\\d{10}$|^\\+[1-9]\\d{7,14}$",
            message = "El teléfono debe tener 10 dígitos mexicanos o usar formato internacional")
    private String telefono;

    @NotBlank(message = "El mensaje es obligatorio")
    @Size(max = 1600, message = "El mensaje no puede superar los 1600 caracteres")
    private String mensaje;

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
