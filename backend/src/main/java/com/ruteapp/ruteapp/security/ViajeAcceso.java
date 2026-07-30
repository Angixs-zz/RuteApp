package com.ruteapp.ruteapp.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import com.ruteapp.ruteapp.model.EstadoInvitacion;
import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ParticipanteViajeRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;

@Component
public class ViajeAcceso {

    private final UsuarioRepository usuarioRepository;
    private final ParticipanteViajeRepository participanteRepository;

    public ViajeAcceso(
            UsuarioRepository usuarioRepository,
            ParticipanteViajeRepository participanteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.participanteRepository = participanteRepository;
    }

    public Usuario obtenerUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new AccessDeniedException("Usuario autenticado no encontrado"));
    }

    public void validarLectura(Viaje viaje, String correo, boolean esAdministrador) {
        if (esAdministrador || Boolean.TRUE.equals(viaje.getPublico())
                || esOrganizador(viaje, correo) || esParticipanteAceptado(viaje, correo)) {
            return;
        }
        throw new AccessDeniedException("No tienes acceso a este viaje");
    }

    public void validarAccesoInterno(Viaje viaje, String correo, boolean esAdministrador) {
        if (esAdministrador || esOrganizador(viaje, correo) || esParticipanteAceptado(viaje, correo)) {
            return;
        }
        throw new AccessDeniedException("No tienes acceso a los datos internos de este viaje");
    }

    public void validarGestion(Viaje viaje, String correo, boolean esAdministrador) {
        if (esAdministrador || esOrganizador(viaje, correo)) {
            return;
        }
        throw new AccessDeniedException("Solo el organizador puede modificar este viaje");
    }

    public void validarColaboracion(Viaje viaje, String correo, boolean esAdministrador) {
        if (esAdministrador || esOrganizador(viaje, correo)) {
            return;
        }

        Usuario usuario = obtenerUsuario(correo);
        boolean puedeColaborar = participanteRepository.findByUsuarioAndViaje(usuario, viaje)
                .filter(participante -> participante.getEstadoInvitacion() == EstadoInvitacion.ACEPTADA)
                .map(ParticipanteViaje::getPermisoColaborar)
                .orElse(false);
        if (!puedeColaborar) {
            throw new AccessDeniedException("No tienes permiso para colaborar en este viaje");
        }
    }

    public boolean perteneceAlViaje(Viaje viaje, Usuario usuario) {
        return viaje.getOrganizador().getId().equals(usuario.getId())
                || participanteRepository.findByUsuarioAndViaje(usuario, viaje)
                        .filter(participante -> participante.getEstadoInvitacion() == EstadoInvitacion.ACEPTADA)
                        .isPresent();
    }

    private boolean esOrganizador(Viaje viaje, String correo) {
        return viaje.getOrganizador().getCorreo().equals(correo);
    }

    private boolean esParticipanteAceptado(Viaje viaje, String correo) {
        Usuario usuario = obtenerUsuario(correo);
        return participanteRepository.findByUsuarioAndViaje(usuario, viaje)
                .filter(participante -> participante.getEstadoInvitacion() == EstadoInvitacion.ACEPTADA)
                .isPresent();
    }
}
