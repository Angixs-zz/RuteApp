package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ParticipanteEntrada {

    private Long usuarioId;

    @Email(message = "El correo del usuario no es válido")
    private String correoUsuario;

    @Pattern(
            regexp = "^(?:\\+?52)?\\d{10}$|^\\+[1-9]\\d{7,14}$",
            message = "El teléfono debe tener 10 dígitos mexicanos o usar formato internacional")
    private String telefonoUsuario;

    @Pattern(
            regexp = "(?i)^(CORREO|WHATSAPP)$",
            message = "El canal de invitación debe ser CORREO o WHATSAPP")
    private String canalInvitacion;

    @NotNull(message = "El ID del viaje es obligatorio")
    private Long viajeId;

    @Size(max = 30, message = "El estado de invitación no puede superar los 30 caracteres")
    private String estadoInvitacion; // PENDIENTE, ACEPTADA, RECHAZADA

    private Boolean permisoColaborar;

    @AssertTrue(message = "Debes indicar el correo o teléfono que deseas invitar")
    public boolean isUsuarioIdentificado() {
        if (usuarioId != null) {
            return true;
        }
        if ("WHATSAPP".equalsIgnoreCase(canalInvitacion)) {
            return telefonoUsuario != null && !telefonoUsuario.isBlank();
        }
        return correoUsuario != null && !correoUsuario.isBlank();
    }

    // Getters y Setters
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getCorreoUsuario() { return correoUsuario; }
    public void setCorreoUsuario(String correoUsuario) { this.correoUsuario = correoUsuario; }

    public String getTelefonoUsuario() { return telefonoUsuario; }
    public void setTelefonoUsuario(String telefonoUsuario) { this.telefonoUsuario = telefonoUsuario; }

    public String getCanalInvitacion() { return canalInvitacion; }
    public void setCanalInvitacion(String canalInvitacion) { this.canalInvitacion = canalInvitacion; }

    public Long getViajeId() { return viajeId; }
    public void setViajeId(Long viajeId) { this.viajeId = viajeId; }

    public String getEstadoInvitacion() { return estadoInvitacion; }
    public void setEstadoInvitacion(String estadoInvitacion) { this.estadoInvitacion = estadoInvitacion; }

    public Boolean getPermisoColaborar() { return permisoColaborar; }
    public void setPermisoColaborar(Boolean permisoColaborar) { this.permisoColaborar = permisoColaborar; }
}
