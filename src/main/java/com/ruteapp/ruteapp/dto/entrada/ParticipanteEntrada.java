package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ParticipanteEntrada {

    @NotNull(message = "El ID del usuario es obligatorio")
    private Long usuarioId;

    @NotNull(message = "El ID del viaje es obligatorio")
    private Long viajeId;

    @Size(max = 30, message = "El estado de invitación no puede superar los 30 caracteres")
    private String estadoInvitacion; // PENDIENTE, ACEPTADA, RECHAZADA

    private Boolean permisoColaborar;

    // Getters y Setters
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Long getViajeId() { return viajeId; }
    public void setViajeId(Long viajeId) { this.viajeId = viajeId; }

    public String getEstadoInvitacion() { return estadoInvitacion; }
    public void setEstadoInvitacion(String estadoInvitacion) { this.estadoInvitacion = estadoInvitacion; }

    public Boolean getPermisoColaborar() { return permisoColaborar; }
    public void setPermisoColaborar(Boolean permisoColaborar) { this.permisoColaborar = permisoColaborar; }
}