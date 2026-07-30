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
import com.ruteapp.ruteapp.security.ViajeAcceso;

@Service
public class ViajeService {

    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final LugarPersistenciaService lugarPersistenciaService;
    private final ParticipanteViajeRepository participanteViajeRepository;
    private final WhatsAppService whatsAppService;
    private final ViajeAcceso viajeAcceso;

    public ViajeService(
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository,
            LugarPersistenciaService lugarPersistenciaService,
            ParticipanteViajeRepository participanteViajeRepository,
            WhatsAppService whatsAppService,
            ViajeAcceso viajeAcceso) {

        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.lugarPersistenciaService = lugarPersistenciaService;
        this.participanteViajeRepository = participanteViajeRepository;
        this.whatsAppService = whatsAppService;
        this.viajeAcceso = viajeAcceso;
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
                    estado,
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

    public ViajeRespuesta buscarPorId(Long id, String correoAutenticado, boolean esAdministrador) {

        Viaje viaje = obtenerEntidadPorId(id);
        viajeAcceso.validarLectura(viaje, correoAutenticado, esAdministrador);

        return convertirARespuesta(viaje);
    }

    public List<ViajeRespuesta> listarPublicos() {

        List<Viaje> viajes = viajeRepository.findByPublicoTrue();
        List<ViajeRespuesta> respuestas = new ArrayList<>();

        for (Viaje viaje : viajes) {
            if ("AGENCIA".equals(viaje.getOrganizador().getRol().getNombre())) {
                respuestas.add(convertirARespuesta(viaje));
            }
        }

        return respuestas;
    }

    public List<ViajeRespuesta> listarPorOrganizador(
            Long organizadorId, String correoAutenticado, boolean esAdministrador) {

        Usuario organizador = usuarioRepository
                .findById(organizadorId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Organizador no encontrado"));

        if (!esAdministrador && !organizador.getCorreo().equals(correoAutenticado)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Solo puedes consultar tus viajes organizados");
        }

        List<Viaje> viajes =
                viajeRepository.findByOrganizador(organizador);

        List<ViajeRespuesta> respuestas = new ArrayList<>();

        for (Viaje viaje : viajes) {
            respuestas.add(convertirARespuesta(viaje));
        }

        return respuestas;
    }

    public ViajeRespuesta crear(ViajeEntrada entrada, String correoAutenticado) {

        validarFechas(entrada);

        Usuario organizador = usuarioRepository
                .findByCorreo(correoAutenticado)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Organizador no encontrado"));

        Viaje viaje = new Viaje();

        copiarDatos(entrada, viaje, organizador, true);

        Viaje guardado = viajeRepository.save(viaje);

        return convertirARespuesta(guardado);
    }

    public ViajeRespuesta actualizar(
            Long id,
            ViajeEntrada entrada,
            String correoAutenticado,
            boolean esAdministrador) {

        validarFechas(entrada);

        Viaje viaje = obtenerEntidadPorId(id);
        viajeAcceso.validarGestion(viaje, correoAutenticado, esAdministrador);
        EstadoViaje estadoAnterior = viaje.getEstado();

        copiarDatos(entrada, viaje, viaje.getOrganizador(), false);

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

    public void eliminar(Long id, String correoAutenticado, boolean esAdministrador) {

        Viaje viaje = obtenerEntidadPorId(id);
        viajeAcceso.validarGestion(viaje, correoAutenticado, esAdministrador);

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
            Usuario organizador,
            boolean esCreacion) {

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

        if (entrada.getPublico() != null) {
            if (Boolean.TRUE.equals(entrada.getPublico())
                    && !"AGENCIA".equals(organizador.getRol().getNombre())) {
                throw new IllegalArgumentException("Solo una agencia puede publicar viajes");
            }
            viaje.setPublico(entrada.getPublico());
        } else if (esCreacion) {
            viaje.setPublico(false);
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
        
        long countConfirmados = participanteViajeRepository.countByViajeAndEstadoInvitacion(viaje, EstadoInvitacion.ACEPTADA);
        long totalParticipantes = countConfirmados + 1; // +1 del organizador

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
                viaje.getFechaCreacion(),
                totalParticipantes
        );
    }
}
