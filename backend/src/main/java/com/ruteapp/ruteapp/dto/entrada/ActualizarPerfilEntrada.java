package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ActualizarPerfilEntrada {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    private String correo;

    @Pattern(
            regexp = "^$|^\\+[1-9]\\d{7,14}$",
            message = "El teléfono debe usar formato internacional, por ejemplo +5219511168398")
    private String telefono;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
