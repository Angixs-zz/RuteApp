package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.dto.entrada.ViajeEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ViajeRespuesta;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.EstadoViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.repositories.ViajeRepository;

@Service
public class ViajeService {

    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;

    public ViajeService(
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository) {

        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<ViajeRespuesta> listarTodos() {

        List<Viaje> viajes = viajeRepository.findAll();
        List<ViajeRespuesta> respuestas = new ArrayList<>();

        for (Viaje viaje : viajes) {
            respuestas.add(convertirARespuesta(viaje));
        }

        return respuestas;
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

        Usuario organizador = usuarioRepository
                .findById(entrada.getOrganizadorId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Organizador no encontrado"));

        copiarDatos(entrada, viaje, organizador);

        Viaje actualizado = viajeRepository.save(viaje);

        return convertirARespuesta(actualizado);
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