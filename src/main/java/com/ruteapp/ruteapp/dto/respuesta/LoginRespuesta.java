package com.ruteapp.ruteapp.dto.respuesta;

public class LoginRespuesta {

    private String token;
    private String tipo;
    private Long usuarioId;
    private String nombre;
    private String correo;
    private String rol;

    public LoginRespuesta(
            String token,
            String tipo,
            Long usuarioId,
            String nombre,
            String correo,
            String rol) {

        this.token = token;
        this.tipo = tipo;
        this.usuarioId = usuarioId;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
    }

    public String getToken() {
        return token;
    }

    public String getTipo() {
        return tipo;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getNombre() {
        return nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public String getRol() {
        return rol;
    }
}
