package com.ruteapp.ruteapp.dto.respuesta;

import java.time.LocalDateTime;

public class UsuarioRespuesta {

    private Long id;
    private String nombre;
    private String correo;
    private String avatar;
    private Boolean activo;
    private String rol;
    private LocalDateTime fechaCreacion;

    public UsuarioRespuesta() {
    }

    public UsuarioRespuesta(
            Long id,
            String nombre,
            String correo,
            String avatar,
            Boolean activo,
            String rol,
            LocalDateTime fechaCreacion) {

        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.avatar = avatar;
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

    public String getAvatar() {
        return avatar;
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