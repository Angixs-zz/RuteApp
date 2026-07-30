package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import com.ruteapp.ruteapp.dto.entrada.ParticipanteEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ParticipanteRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.WhatsAppRespuesta;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.EstadoInvitacion;
import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ParticipanteViajeRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.repositories.ViajeRepository;
import com.ruteapp.ruteapp.util.TelefonoUtil;

@Service
public class ParticipanteViajeService {

    private final ParticipanteViajeRepository participanteViajeRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicioCorreo servicioCorreo;
    private final String invitationUrl;
    private final WhatsAppService whatsAppService;

    public ParticipanteViajeService(
            ParticipanteViajeRepository participanteViajeRepository,
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository,
            ServicioCorreo servicioCorreo,
            WhatsAppService whatsAppService,
            @Value("${app.invitation-url}") String invitationUrl) {
        this.participanteViajeRepository = participanteViajeRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicioCorreo = servicioCorreo;
        this.whatsAppService = whatsAppService;
        this.invitationUrl = invitationUrl;
    }

    public List<ParticipanteRespuesta> listarTodos(String correoUsuario) {
        List<ParticipanteViaje> participantes;
        if (correoUsuario == null) {
            participantes = participanteViajeRepository.findAll();
        } else {
            Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Usuario no encontrado"
                    ));
            participantes = participanteViajeRepository.findByUsuario(usuario);
        }
        List<ParticipanteRespuesta> respuestas = new ArrayList<>();
        for (ParticipanteViaje p : participantes) {
            respuestas.add(convertirARespuesta(p));
        }
        return respuestas;
    }

    public ParticipanteRespuesta buscarPorId(Long id) {
        ParticipanteViaje participante = obtenerEntidadPorId(id);
        return convertirARespuesta(participante);
    }

    public List<ParticipanteRespuesta> listarPorViaje(Long viajeId) {
        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Viaje no encontrado"));
        
        List<ParticipanteViaje> participantes = participanteViajeRepository.findByViaje(viaje);
        List<ParticipanteRespuesta> respuestas = new ArrayList<>();
        for (ParticipanteViaje p : participantes) {
            respuestas.add(convertirARespuesta(p));
        }
        return respuestas;
    }

    @Transactional
    public ParticipanteRespuesta crear(
            ParticipanteEntrada entrada,
            String correoAutenticado,
            boolean esAdministrador) {
        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Viaje no encontrado"));

        if (!esAdministrador
                && !viaje.getOrganizador().getCorreo().equals(correoAutenticado)) {
            throw new AccessDeniedException(
                    "Solo el organizador puede invitar participantes"
            );
        }

        Usuario usuario = obtenerUsuarioInvitado(entrada);

        if (usuario.getRol() != null && "AGENCIA".equals(usuario.getRol().getNombre())) {
            throw new IllegalArgumentException(
                    "No puedes enviar invitaciones a un usuario de tipo Agencia"
            );
        }

        if (participanteViajeRepository.existsByViajeAndUsuario(viaje, usuario)) {
            throw new IllegalArgumentException(
                    "El usuario ya fue invitado a este viaje"
            );
        }

        ParticipanteViaje participante = new ParticipanteViaje();
        participante.setViaje(viaje);
        participante.setUsuario(usuario);
        
        if (entrada.getEstadoInvitacion() != null && !entrada.getEstadoInvitacion().isBlank()) {
            participante.setEstadoInvitacion(EstadoInvitacion.valueOf(entrada.getEstadoInvitacion().toUpperCase()));
        }

        if (entrada.getPermisoColaborar() != null) {
            participante.setPermisoColaborar(entrada.getPermisoColaborar());
        }

        ParticipanteViaje guardado = participanteViajeRepository.save(participante);
        if ("WHATSAPP".equalsIgnoreCase(entrada.getCanalInvitacion())) {
            whatsAppService.enviar(
                    usuario.getTelefono(),
                    "Hola " + usuario.getNombre() + ", "
                            + viaje.getOrganizador().getNombre()
                            + " te invitó al viaje \"" + viaje.getNombre()
                            + "\" en RuteApp.\n\n"
                            + invitationUrl + "\n\n"
                            + "Entra para aceptar o rechazar."
            );
        } else {
            servicioCorreo.enviarInvitacion(usuario, viaje);
        }
        return convertirARespuesta(guardado);
    }

    public ParticipanteRespuesta responderInvitacion(
            Long id,
            EstadoInvitacion respuesta,
            String correoAutenticado) {
        ParticipanteViaje participante = obtenerEntidadPorId(id);

        if (!participante.getUsuario().getCorreo().equals(correoAutenticado)) {
            throw new AccessDeniedException(
                    "Solo el usuario invitado puede responder esta invitación"
            );
        }

        participante.setEstadoInvitacion(respuesta);
        ParticipanteViaje actualizado = participanteViajeRepository.save(participante);
        whatsAppService.enviarNotificacion(
                participante.getViaje().getOrganizador(),
                participante.getUsuario().getNombre()
                        + " " + (respuesta == EstadoInvitacion.ACEPTADA
                                ? "aceptó" : "rechazó")
                        + " la invitación al viaje \""
                        + participante.getViaje().getNombre() + "\"."
        );
        return convertirARespuesta(actualizado);
    }

    public WhatsAppRespuesta notificarPorWhatsApp(
            Long id,
            String correoAutenticado,
            boolean esAdministrador) {
        ParticipanteViaje participante = obtenerEntidadPorId(id);
        Viaje viaje = participante.getViaje();

        if (!esAdministrador
                && !viaje.getOrganizador().getCorreo().equals(correoAutenticado)) {
            throw new AccessDeniedException(
                    "Solo el organizador puede notificar a los participantes"
            );
        }

        Usuario usuario = participante.getUsuario();
        if (usuario.getTelefono() == null || usuario.getTelefono().isBlank()) {
            throw new IllegalArgumentException(
                    "El participante no tiene un teléfono registrado"
            );
        }

        return whatsAppService.enviar(
                usuario.getTelefono(),
                "Hola " + usuario.getNombre() + ", recuerda revisar el viaje \""
                        + viaje.getNombre() + "\" en RuteApp."
        );
    }

    public void eliminar(Long id) {
        ParticipanteViaje participante = obtenerEntidadPorId(id);
        participanteViajeRepository.delete(participante);
    }

    public ParticipanteViaje obtenerEntidadPorId(Long id) {
        return participanteViajeRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Participante no encontrado"));
    }


    public ParticipanteRespuesta actualizar(Long id, ParticipanteEntrada entrada) {
        ParticipanteViaje participante = obtenerEntidadPorId(id);

        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Viaje no encontrado"));

        Usuario usuario = usuarioRepository.findById(entrada.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        participante.setViaje(viaje);
        participante.setUsuario(usuario);

        if (entrada.getEstadoInvitacion() != null && !entrada.getEstadoInvitacion().isBlank()) {
            participante.setEstadoInvitacion(EstadoInvitacion.valueOf(entrada.getEstadoInvitacion().toUpperCase()));
        }

        if (entrada.getPermisoColaborar() != null) {
            participante.setPermisoColaborar(entrada.getPermisoColaborar());
        }

        ParticipanteViaje actualizado = participanteViajeRepository.save(participante);
        return convertirARespuesta(actualizado);
    }

    private ParticipanteRespuesta convertirARespuesta(ParticipanteViaje p) {
        ParticipanteRespuesta respuesta = new ParticipanteRespuesta();
        respuesta.setId(p.getId());
        respuesta.setUsuarioId(p.getUsuario().getId());
        respuesta.setNombreUsuario(p.getUsuario().getNombre());
        respuesta.setCorreoUsuario(p.getUsuario().getCorreo());
        respuesta.setWhatsappDisponible(
                p.getUsuario().getTelefono() != null
                        && !p.getUsuario().getTelefono().isBlank()
        );
        respuesta.setViajeId(p.getViaje().getId());
        respuesta.setNombreViaje(p.getViaje().getNombre());
        respuesta.setNombreOrganizador(p.getViaje().getOrganizador().getNombre());
        respuesta.setFechaInicioViaje(p.getViaje().getFechaInicio());
        respuesta.setFechaFinViaje(p.getViaje().getFechaFin());
        respuesta.setEstadoInvitacion(p.getEstadoInvitacion().name());
        respuesta.setPermisoColaborar(p.getPermisoColaborar());
        respuesta.setFechaIncorporacion(p.getFechaIncorporacion());
        return respuesta;
    }

    private Usuario obtenerUsuarioInvitado(ParticipanteEntrada entrada) {
        if (entrada.getUsuarioId() != null) {
            return usuarioRepository.findById(entrada.getUsuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Usuario no encontrado"
                    ));
        }

        if ("WHATSAPP".equalsIgnoreCase(entrada.getCanalInvitacion())) {
            List<Usuario> usuarios = usuarioRepository.findByTelefonoIn(
                    TelefonoUtil.variantesBusqueda(entrada.getTelefonoUsuario())
            );
            if (usuarios.isEmpty()) {
                throw new RecursoNoEncontradoException(
                        "No existe una cuenta registrada con ese teléfono"
                );
            }
            if (usuarios.size() > 1) {
                throw new IllegalArgumentException(
                        "Hay más de una cuenta registrada con ese teléfono"
                );
            }
            return usuarios.getFirst();
        }

        return usuarioRepository.findByCorreoIgnoreCase(entrada.getCorreoUsuario().trim())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una cuenta registrada con ese correo"
                ));
    }
}
