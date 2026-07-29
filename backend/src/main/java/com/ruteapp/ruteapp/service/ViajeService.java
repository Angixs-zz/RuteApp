package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.dto.entrada.ViajeEntrada;
import com.ruteapp.ruteapp.dto.respuesta.PaginaRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.ViajeRespuesta;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.EstadoInvitacion;
import com.ruteapp.ruteapp.model.EstadoViaje;
import com.ruteapp.ruteapp.model.Lugar;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.repositories.ParticipanteViajeRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.repositories.ViajeRepository;

@Service
public class ViajeService {

    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final LugarPersistenciaService lugarPersistenciaService;
    private final ParticipanteViajeRepository participanteViajeRepository;
    private final WhatsAppService whatsAppService;

    public ViajeService(
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository,
            LugarPersistenciaService lugarPersistenciaService,
            ParticipanteViajeRepository participanteViajeRepository,
            WhatsAppService whatsAppService) {

        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.lugarPersistenciaService = lugarPersistenciaService;
        this.participanteViajeRepository = participanteViajeRepository;
        this.whatsAppService = whatsAppService;
    }

    public List<ViajeRespuesta> listarTodos() {

        List<Viaje> viajes = viajeRepository.findAll();
        List<ViajeRespuesta> respuestas = new ArrayList<>();

        for (Viaje viaje : viajes) {
            respuestas.add(convertirARespuesta(viaje));
        }

        return respuestas;
    }

    public PaginaRespuesta<ViajeRespuesta> listarPaginados(
            int pagina,
            int tamanio,
            String busqueda,
            String correoOrganizador,
            EstadoViaje estado) {

        if (pagina < 0) {
            throw new IllegalArgumentException("La página no puede ser menor que 0");
        }

        if (tamanio < 1 || tamanio > 50) {
            throw new IllegalArgumentException("El tamaño de la página debe estar entre 1 y 50");
        }

        Pageable pageable = PageRequest.of(
                pagina,
                tamanio,
                Sort.by("fechaCreacion").descending()
        );

        String texto = busqueda == null ? "" : busqueda.trim();

        Page<Viaje> resultado;
        if (correoOrganizador != null) {
            resultado = viajeRepository.buscarDelUsuario(
                    correoOrganizador,
                    EstadoInvitacion.ACEPTADA,
                    texto,
                    pageable
            );
        } else {
            resultado = viajeRepository.buscarTodos(texto, estado, pageable);
        }

        List<ViajeRespuesta> contenido = resultado
                .getContent()
                .stream()
                .map(this::convertirARespuesta)
                .toList();

        return new PaginaRespuesta<>(
                contenido,
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages(),
                resultado.isLast()
        );
    }

    public ViajeRespuesta buscarPorId(Long id) {

        Viaje viaje = obtenerEntidadPorId(id);

        return convertirARespuesta(viaje);
    }

    public List<ViajeRespuesta> listarPublicos() {

        List<Viaje> viajes = viajeRepository.findByPublicoTrue();
        List<ViajeRespuesta> respuestas = new ArrayList<>();

        for (Viaje viaje : viajes) {
            respuestas.add(convertirARespuesta(viaje));
        }

        return respuestas;
    }

    public List<ViajeRespuesta> listarPorOrganizador(Long organizadorId) {

        Usuario organizador = usuarioRepository
                .findById(organizadorId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Organizador no encontrado"));

        List<Viaje> viajes =
                viajeRepository.findByOrganizador(organizador);

        List<ViajeRespuesta> respuestas = new ArrayList<>();

        for (Viaje viaje : viajes) {
            respuestas.add(convertirARespuesta(viaje));
        }

        return respuestas;
    }

    public ViajeRespuesta crear(ViajeEntrada entrada) {

        validarFechas(entrada);

        Usuario organizador = usuarioRepository
                .findById(entrada.getOrganizadorId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Organizador no encontrado"));

        Viaje viaje = new Viaje();

        copiarDatos(entrada, viaje, organizador);

        Viaje guardado = viajeRepository.save(viaje);

        return convertirARespuesta(guardado);
    }

    public ViajeRespuesta actualizar(
            Long id,
            ViajeEntrada entrada) {

        validarFechas(entrada);

        Viaje viaje = obtenerEntidadPorId(id);
        EstadoViaje estadoAnterior = viaje.getEstado();

        Usuario organizador = usuarioRepository
                .findById(entrada.getOrganizadorId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Organizador no encontrado"));

        copiarDatos(entrada, viaje, organizador);

        Viaje actualizado = viajeRepository.save(viaje);

        if (estadoAnterior != actualizado.getEstado()) {
            notificarCambioEstado(actualizado);
        }

        return convertirARespuesta(actualizado);
    }

    private void notificarCambioEstado(Viaje viaje) {
        List<ParticipanteViaje> participantes =
                participanteViajeRepository.findByViaje(viaje);

        for (ParticipanteViaje participante : participantes) {
            if (participante.getEstadoInvitacion() == EstadoInvitacion.ACEPTADA) {
                whatsAppService.enviarNotificacion(
                        participante.getUsuario(),
                        "El viaje \"" + viaje.getNombre()
                                + "\" cambió al estado " + viaje.getEstado() + "."
                );
            }
        }
    }

    public void eliminar(Long id) {

        Viaje viaje = obtenerEntidadPorId(id);

        viajeRepository.delete(viaje);
    }

    public Viaje obtenerEntidadPorId(Long id) {

        return viajeRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Viaje no encontrado"));
    }

    private void copiarDatos(
            ViajeEntrada entrada,
            Viaje viaje,
            Usuario organizador) {

        viaje.setNombre(entrada.getNombre());
        viaje.setDescripcion(entrada.getDescripcion());
        viaje.setOrigen(entrada.getOrigen());
        viaje.setDestino(entrada.getDestino());
        viaje.setFechaInicio(entrada.getFechaInicio());
        viaje.setFechaFin(entrada.getFechaFin());
        viaje.setPresupuestoEstimado(
                entrada.getPresupuestoEstimado()
        );
        viaje.setTransporte(entrada.getTransporte());
        viaje.setOrganizador(organizador);

        if (entrada.getEstado() == null) {
            viaje.setEstado(EstadoViaje.PLANIFICACION);
        } else {
            viaje.setEstado(entrada.getEstado());
        }

        if (entrada.getPublico() == null) {
            viaje.setPublico(false);
        } else {
            viaje.setPublico(entrada.getPublico());
        }

        if (entrada.getOrigenLugar() != null) {
            Lugar origen = lugarPersistenciaService.obtenerOCrear(entrada.getOrigenLugar());
            viaje.setOrigenLugar(origen);
        }

        if (entrada.getDestinoLugar() != null) {
            Lugar destino = lugarPersistenciaService.obtenerOCrear(entrada.getDestinoLugar());
            viaje.setDestinoLugar(destino);
        }
    }

    private void validarFechas(ViajeEntrada entrada) {

        if (entrada.getFechaFin()
                .isBefore(entrada.getFechaInicio())) {

            throw new RuntimeException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio"
            );
        }
    }

    private ViajeRespuesta convertirARespuesta(Viaje viaje) {

        return new ViajeRespuesta(
                viaje.getId(),
                viaje.getNombre(),
                viaje.getDescripcion(),
                viaje.getOrigen(),
                viaje.getDestino(),
                lugarPersistenciaService.convertirARespuesta(viaje.getOrigenLugar()),
                lugarPersistenciaService.convertirARespuesta(viaje.getDestinoLugar()),
                viaje.getFechaInicio(),
                viaje.getFechaFin(),
                viaje.getPresupuestoEstimado(),
                viaje.getTransporte(),
                viaje.getEstado(),
                viaje.getPublico(),
                viaje.getOrganizador().getId(),
                viaje.getOrganizador().getNombre(),
                viaje.getFechaCreacion()
        );
    }
}
