package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RolEntrada {

    @NotBlank(message = "El nombre del rol no puede estar vacío")
    @Size(max = 30, message = "El nombre del rol no puede superar los 30 caracteres")
    private String nombre;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}