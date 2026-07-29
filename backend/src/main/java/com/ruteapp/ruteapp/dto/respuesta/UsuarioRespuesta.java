package com.ruteapp.ruteapp.dto.respuesta;

import java.time.LocalDateTime;

public class UsuarioRespuesta {

    private Long id;
    private String nombre;
    private String correo;
    private String telefono;
    private Boolean activo;
    private String rol;
    private LocalDateTime fechaCreacion;

    public UsuarioRespuesta() {
    }

    public UsuarioRespuesta(
            Long id,
            String nombre,
            String correo,
            String telefono,
            Boolean activo,
            String rol,
            LocalDateTime fechaCreacion) {

        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.activo = activo;
        this.rol = rol;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public Boolean getActivo() {
        return activo;
    }

    public String getRol() {
        return rol;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}