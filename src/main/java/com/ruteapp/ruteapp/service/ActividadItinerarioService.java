package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.dto.entrada.ActividadEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ActividadRespuesta;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.ActividadItinerario;
import com.ruteapp.ruteapp.model.Lugar;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ActividadItinerarioRepository;
import com.ruteapp.ruteapp.repositories.ParticipanteViajeRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.repositories.ViajeRepository;

@Service
public class ActividadItinerarioService {

    private final ActividadItinerarioRepository actividadRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final ParticipanteViajeRepository participanteViajeRepository;
    private final LugarPersistenciaService lugarPersistenciaService;

    public ActividadItinerarioService(
            ActividadItinerarioRepository actividadRepository,
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository,
            ParticipanteViajeRepository participanteViajeRepository,
            LugarPersistenciaService lugarPersistenciaService) {
        this.actividadRepository = actividadRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.participanteViajeRepository = participanteViajeRepository;
        this.lugarPersistenciaService = lugarPersistenciaService;
    }

    public List<ActividadRespuesta> listarTodos() {
        List<ActividadItinerario> actividades = actividadRepository.findAll();
        List<ActividadRespuesta> respuestas = new ArrayList<>();
        for (ActividadItinerario a : actividades) {
            respuestas.add(convertirARespuesta(a));
        }
        return respuestas;
    }

    public ActividadRespuesta buscarPorId(Long id) {
        ActividadItinerario actividad = obtenerEntidadPorId(id);
        return convertirARespuesta(actividad);
    }

    public List<ActividadRespuesta> listarPorViajeId(Long viajeId) {
        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Viaje no encontrado"));

        List<ActividadItinerario> actividades = actividadRepository.findByViaje(viaje);
        List<ActividadRespuesta> respuestas = new ArrayList<>();
        for (ActividadItinerario a : actividades) {
            respuestas.add(convertirARespuesta(a));
        }
        return respuestas;
    }

    public ActividadRespuesta crear(ActividadEntrada entrada) {
        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Viaje no encontrado"));

        Usuario responsable = usuarioRepository.findById(entrada.getResponsableId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario responsable no encontrado"));

        boolean esOrganizador = viaje.getOrganizador() != null && viaje.getOrganizador().getId().equals(responsable.getId());        
        boolean esParticipante = participanteViajeRepository.existsByViajeAndUsuario(viaje, responsable);

        if (!esOrganizador && !esParticipante) {
            throw new IllegalArgumentException("El usuario responsable no pertenece a este viaje");
        }

        ActividadItinerario actividad = new ActividadItinerario();
        actividad.setViaje(viaje);
        actividad.setLugar(entrada.getLugar());
        actividad.setHorario(entrada.getHorario());
        actividad.setDescripcion(entrada.getDescripcion());
        actividad.setResponsable(responsable);
        actividad.setCostoEstimado(entrada.getCostoEstimado());

        if (entrada.getEstado() != null && !entrada.getEstado().isBlank()) {
            actividad.setEstado(entrada.getEstado());
        }

        if (entrada.getLugarReferencia() != null) {
            Lugar lugar = lugarPersistenciaService.obtenerOCrear(entrada.getLugarReferencia());
            actividad.setLugarReferencia(lugar);
        }

        ActividadItinerario guardada = actividadRepository.save(actividad);
        return convertirARespuesta(guardada);
    }

    // MÉTODO NUEVO PARA ACTUALIZAR
    public ActividadRespuesta actualizar(Long id, ActividadEntrada entrada) {
        ActividadItinerario actividad = obtenerEntidadPorId(id);

        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Viaje no encontrado"));

        Usuario responsable = usuarioRepository.findById(entrada.getResponsableId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario responsable no encontrado"));

        boolean esOrganizador = viaje.getOrganizador() != null && viaje.getOrganizador().getId().equals(responsable.getId());        
        boolean esParticipante = participanteViajeRepository.existsByViajeAndUsuario(viaje, responsable);

        if (!esOrganizador && !esParticipante) {
            throw new IllegalArgumentException("El usuario responsable no pertenece a este viaje");
        }

        actividad.setViaje(viaje);
        actividad.setLugar(entrada.getLugar());
        actividad.setHorario(entrada.getHorario());
        actividad.setDescripcion(entrada.getDescripcion());
        actividad.setResponsable(responsable);
        actividad.setCostoEstimado(entrada.getCostoEstimado());

        if (entrada.getEstado() != null && !entrada.getEstado().isBlank()) {
            actividad.setEstado(entrada.getEstado());
        }

        if (entrada.getLugarReferencia() != null) {
            Lugar lugar = lugarPersistenciaService.obtenerOCrear(entrada.getLugarReferencia());
            actividad.setLugarReferencia(lugar);
        }

        ActividadItinerario actualizada = actividadRepository.save(actividad);
        return convertirARespuesta(actualizada);
    }

    public void eliminar(Long id) {
        ActividadItinerario actividad = obtenerEntidadPorId(id);
        actividadRepository.delete(actividad);
    }

    public ActividadItinerario obtenerEntidadPorId(Long id) {
        return actividadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Actividad no encontrada"));
    }

    private ActividadRespuesta convertirARespuesta(ActividadItinerario a) {
        ActividadRespuesta respuesta = new ActividadRespuesta();
        respuesta.setId(a.getId());
        respuesta.setViajeId(a.getViaje().getId());
        respuesta.setNombreViaje(a.getViaje().getNombre());
        respuesta.setLugar(a.getLugar());
        respuesta.setHorario(a.getHorario());
        respuesta.setDescripcion(a.getDescripcion());
        respuesta.setResponsableId(a.getResponsable().getId());
        respuesta.setNombreResponsable(a.getResponsable().getNombre());
        respuesta.setCostoEstimado(a.getCostoEstimado());
        respuesta.setEstado(a.getEstado());
        respuesta.setLugarReferencia(
                lugarPersistenciaService.convertirARespuesta(a.getLugarReferencia()));
        return respuesta;
    }
}