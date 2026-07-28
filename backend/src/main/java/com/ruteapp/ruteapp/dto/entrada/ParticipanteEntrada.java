package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ParticipanteEntrada {

    private Long usuarioId;

    @Email(message = "El correo del usuario no es válido")
    private String correoUsuario;

    @NotNull(message = "El ID del viaje es obligatorio")
    private Long viajeId;

    @Size(max = 30, message = "El estado de invitación no puede superar los 30 caracteres")
    private String estadoInvitacion; // PENDIENTE, ACEPTADA, RECHAZADA

    private Boolean permisoColaborar;

    @AssertTrue(message = "Debes indicar el usuario o correo que deseas invitar")
    public boolean isUsuarioIdentificado() {
        return usuarioId != null
                || (correoUsuario != null && !correoUsuario.isBlank());
    }

    // Getters y Setters
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getCorreoUsuario() { return correoUsuario; }
    public void setCorreoUsuario(String correoUsuario) { this.correoUsuario = correoUsuario; }

    public Long getViajeId() { return viajeId; }
    public void setViajeId(Long viajeId) { this.viajeId = viajeId; }

    public String getEstadoInvitacion() { return estadoInvitacion; }
    public void setEstadoInvitacion(String estadoInvitacion) { this.estadoInvitacion = estadoInvitacion; }

    public Boolean getPermisoColaborar() { return permisoColaborar; }
    public void setPermisoColaborar(Boolean permisoColaborar) { this.permisoColaborar = permisoColaborar; }
}
