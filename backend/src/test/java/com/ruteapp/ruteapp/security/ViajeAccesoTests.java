package com.ruteapp.ruteapp.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.ruteapp.ruteapp.model.EstadoInvitacion;
import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ParticipanteViajeRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class ViajeAccesoTests {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ParticipanteViajeRepository participanteRepository;

    private ViajeAcceso viajeAcceso;
    private Viaje viaje;
    private Usuario organizador;
    private Usuario usuario;

    @BeforeEach
    void configurar() {
        viajeAcceso = new ViajeAcceso(usuarioRepository, participanteRepository);

        organizador = new Usuario();
        organizador.setId(1L);
        organizador.setCorreo("agencia@ruteapp.com");

        usuario = new Usuario();
        usuario.setId(2L);
        usuario.setCorreo("usuario@ruteapp.com");

        viaje = new Viaje();
        viaje.setOrganizador(organizador);
        viaje.setPublico(false);
    }

    @Test
    void organizadorPuedeGestionarSuViaje() {
        assertDoesNotThrow(() ->
                viajeAcceso.validarGestion(viaje, organizador.getCorreo(), false));
    }

    @Test
    void usuarioAjenoNoPuedeGestionarNiConsultarDatosInternos() {
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(participanteRepository.findByUsuarioAndViaje(usuario, viaje))
                .thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () ->
                viajeAcceso.validarGestion(viaje, usuario.getCorreo(), false));
        assertThrows(AccessDeniedException.class, () ->
                viajeAcceso.validarAccesoInterno(viaje, usuario.getCorreo(), false));
    }

    @Test
    void viajePublicoPermiteLecturaPeroNoDatosInternos() {
        viaje.setPublico(true);
        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(participanteRepository.findByUsuarioAndViaje(usuario, viaje))
                .thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                viajeAcceso.validarLectura(viaje, usuario.getCorreo(), false));
        assertThrows(AccessDeniedException.class, () ->
                viajeAcceso.validarAccesoInterno(viaje, usuario.getCorreo(), false));
    }

    @Test
    void participanteDebeAceptarYRecibirPermisoParaColaborar() {
        ParticipanteViaje participante = new ParticipanteViaje();
        participante.setUsuario(usuario);
        participante.setViaje(viaje);
        participante.setEstadoInvitacion(EstadoInvitacion.ACEPTADA);
        participante.setPermisoColaborar(true);

        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(participanteRepository.findByUsuarioAndViaje(usuario, viaje))
                .thenReturn(Optional.of(participante));

        assertDoesNotThrow(() ->
                viajeAcceso.validarAccesoInterno(viaje, usuario.getCorreo(), false));
        assertDoesNotThrow(() ->
                viajeAcceso.validarColaboracion(viaje, usuario.getCorreo(), false));
    }

    @Test
    void participanteAceptadoSinPermisoNoPuedeColaborar() {
        ParticipanteViaje participante = new ParticipanteViaje();
        participante.setEstadoInvitacion(EstadoInvitacion.ACEPTADA);
        participante.setPermisoColaborar(false);

        when(usuarioRepository.findByCorreo(usuario.getCorreo())).thenReturn(Optional.of(usuario));
        when(participanteRepository.findByUsuarioAndViaje(usuario, viaje))
                .thenReturn(Optional.of(participante));

        assertThrows(AccessDeniedException.class, () ->
                viajeAcceso.validarColaboracion(viaje, usuario.getCorreo(), false));
    }
}
