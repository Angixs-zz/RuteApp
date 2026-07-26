package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.dto.entrada.ParticipanteEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ParticipanteRespuesta;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.EstadoInvitacion;
import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ParticipanteViajeRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.repositories.ViajeRepository;

@Service
public class ParticipanteViajeService {

    private final ParticipanteViajeRepository participanteViajeRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;

    public ParticipanteViajeService(
            ParticipanteViajeRepository participanteViajeRepository,
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository) {
        this.participanteViajeRepository = participanteViajeRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<ParticipanteRespuesta> listarTodos() {
        List<ParticipanteViaje> participantes = participanteViajeRepository.findAll();
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

    public ParticipanteRespuesta crear(ParticipanteEntrada entrada) {
        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Viaje no encontrado"));

        Usuario usuario = usuarioRepository.findById(entrada.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        ParticipanteViaje participante = new ParticipanteViaje();
        participante.setViaje(viaje);
        participante.setUsuario(usuario);
        
        if (entrada.getEstadoInvitacion() != null && !entrada.getEstadoInvitacion().isBlank()) {
            participante.setEstadoInvitacion(EstadoInvitacion.valueOf(entrada.getEstadoInvitacion().toUpperCase()));
        } else {
            participante.setEstadoInvitacion(EstadoInvitacion.PENDIENTE);
        }

        participante.setPermisoColaborar(entrada.getPermisoColaborar() != null ? entrada.getPermisoColaborar() : false);

        ParticipanteViaje guardado = participanteViajeRepository.save(participante);
        return convertirARespuesta(guardado);
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
        respuesta.setViajeId(p.getViaje().getId());
        respuesta.setNombreViaje(p.getViaje().getNombre());
        respuesta.setEstadoInvitacion(p.getEstadoInvitacion().name());
        respuesta.setPermisoColaborar(p.getPermisoColaborar());
        respuesta.setFechaIncorporacion(p.getFechaIncorporacion());
        return respuesta;
    }
}