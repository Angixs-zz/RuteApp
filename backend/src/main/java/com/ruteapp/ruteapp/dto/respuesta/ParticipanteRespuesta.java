package com.ruteapp.ruteapp.dto.respuesta;

import java.time.LocalDateTime;
import java.time.LocalDate;

public class ParticipanteRespuesta {

    private Long id;
    private Long usuarioId;
    private String nombreUsuario;
    private String correoUsuario;
    private Long viajeId;
    private String nombreViaje;
    private String nombreOrganizador;
    private LocalDate fechaInicioViaje;
    private LocalDate fechaFinViaje;
    private String estadoInvitacion;
    private Boolean permisoColaborar;
    private LocalDateTime fechaIncorporacion;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getCorreoUsuario() { return correoUsuario; }
    public void setCorreoUsuario(String correoUsuario) { this.correoUsuario = correoUsuario; }

    public Long getViajeId() { return viajeId; }
    public void setViajeId(Long viajeId) { this.viajeId = viajeId; }

    public String getNombreViaje() { return nombreViaje; }
    public void setNombreViaje(String nombreViaje) { this.nombreViaje = nombreViaje; }

    public String getNombreOrganizador() { return nombreOrganizador; }
    public void setNombreOrganizador(String nombreOrganizador) { this.nombreOrganizador = nombreOrganizador; }

    public LocalDate getFechaInicioViaje() { return fechaInicioViaje; }
    public void setFechaInicioViaje(LocalDate fechaInicioViaje) { this.fechaInicioViaje = fechaInicioViaje; }

    public LocalDate getFechaFinViaje() { return fechaFinViaje; }
    public void setFechaFinViaje(LocalDate fechaFinViaje) { this.fechaFinViaje = fechaFinViaje; }

    public String getEstadoInvitacion() { return estadoInvitacion; }
    public void setEstadoInvitacion(String estadoInvitacion) { this.estadoInvitacion = estadoInvitacion; }

    public Boolean getPermisoColaborar() { return permisoColaborar; }
    public void setPermisoColaborar(Boolean permisoColaborar) { this.permisoColaborar = permisoColaborar; }

    public LocalDateTime getFechaIncorporacion() { return fechaIncorporacion; }
    public void setFechaIncorporacion(LocalDateTime fechaIncorporacion) { this.fechaIncorporacion = fechaIncorporacion; }
}
