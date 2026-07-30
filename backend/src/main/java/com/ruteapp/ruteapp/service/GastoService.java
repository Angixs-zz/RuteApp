package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.ruteapp.ruteapp.dto.entrada.GastoEntrada;
import com.ruteapp.ruteapp.dto.respuesta.GastoRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.PaginaRespuesta;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.CategoriaGasto;
import com.ruteapp.ruteapp.model.Gasto;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.GastoRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.repositories.ViajeRepository;
import com.ruteapp.ruteapp.security.ViajeAcceso;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final ViajeAcceso viajeAcceso;

    public GastoService(
            GastoRepository gastoRepository,
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository,
            ViajeAcceso viajeAcceso) {

        this.gastoRepository = gastoRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.viajeAcceso = viajeAcceso;
    }

    public List<GastoRespuesta> listarTodos() {

        List<Gasto> gastos = gastoRepository.findAll();
        List<GastoRespuesta> respuestas = new ArrayList<>();

        for (Gasto gasto : gastos) {
            respuestas.add(convertirARespuesta(gasto));
        }

        return respuestas;
    }

    public PaginaRespuesta<GastoRespuesta> listarPaginados(int pagina, int tamanio, String busqueda, CategoriaGasto categoria) {
        Page<GastoRespuesta> resultado = gastoRepository.buscar(busqueda == null ? "" : busqueda.trim(), categoria, PageRequest.of(pagina, tamanio, Sort.by("fecha").descending())).map(this::convertirARespuesta);
        return new PaginaRespuesta<>(resultado.getContent(), resultado.getNumber(), resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages(), resultado.isLast());
    }

    public GastoRespuesta buscarPorId(
            Long id, String correoAutenticado, boolean esAdministrador) {

        Gasto gasto = obtenerEntidadPorId(id);
        viajeAcceso.validarAccesoInterno(
                gasto.getViaje(), correoAutenticado, esAdministrador);

        return convertirARespuesta(gasto);
    }

    public List<GastoRespuesta> listarPorViaje(
            Long viajeId, String correoAutenticado, boolean esAdministrador) {

        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Viaje no encontrado"));
        viajeAcceso.validarAccesoInterno(viaje, correoAutenticado, esAdministrador);

        List<Gasto> gastos = gastoRepository.findByViaje(viaje);
        List<GastoRespuesta> respuestas = new ArrayList<>();

        for (Gasto gasto : gastos) {
            respuestas.add(convertirARespuesta(gasto));
        }

        return respuestas;
    }

    public List<GastoRespuesta> listarPorPagador(
            Long pagadorId, String correoAutenticado, boolean esAdministrador) {

        Usuario pagador = usuarioRepository.findById(pagadorId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario no encontrado"));
        if (!esAdministrador && !pagador.getCorreo().equals(correoAutenticado)) {
            throw new AccessDeniedException("Solo puedes consultar tus gastos");
        }

        List<Gasto> gastos = gastoRepository.findByPagador(pagador);
        List<GastoRespuesta> respuestas = new ArrayList<>();

        for (Gasto gasto : gastos) {
            respuestas.add(convertirARespuesta(gasto));
        }

        return respuestas;
    }

    public GastoRespuesta crear(
            GastoEntrada entrada, String correoAutenticado, boolean esAdministrador) {

        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Viaje no encontrado"));
        viajeAcceso.validarAccesoInterno(viaje, correoAutenticado, esAdministrador);

        Usuario pagador = usuarioRepository.findById(entrada.getPagadorId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario pagador no encontrado"));
        validarPagador(viaje, pagador);
        validarPuedeRegistrarParaPagador(
                viaje, pagador, correoAutenticado, esAdministrador);

        Gasto gasto = new Gasto();

        copiarDatos(entrada, gasto, viaje, pagador);

        Gasto guardado = gastoRepository.save(gasto);

        return convertirARespuesta(guardado);
    }

    public GastoRespuesta actualizar(
            Long id,
            GastoEntrada entrada,
            String correoAutenticado,
            boolean esAdministrador) {

        Gasto gasto = obtenerEntidadPorId(id);
        validarPuedeModificar(gasto, correoAutenticado, esAdministrador);

        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Viaje no encontrado"));
        viajeAcceso.validarAccesoInterno(viaje, correoAutenticado, esAdministrador);

        Usuario pagador = usuarioRepository.findById(entrada.getPagadorId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario pagador no encontrado"));
        validarPagador(viaje, pagador);
        validarPuedeRegistrarParaPagador(
                viaje, pagador, correoAutenticado, esAdministrador);

        copiarDatos(entrada, gasto, viaje, pagador);

        Gasto actualizado = gastoRepository.save(gasto);

        return convertirARespuesta(actualizado);
    }

    public void eliminar(Long id, String correoAutenticado, boolean esAdministrador) {

        Gasto gasto = obtenerEntidadPorId(id);
        validarPuedeModificar(gasto, correoAutenticado, esAdministrador);

        gastoRepository.delete(gasto);
    }

    private void validarPagador(Viaje viaje, Usuario pagador) {
        if (!viajeAcceso.perteneceAlViaje(viaje, pagador)) {
            throw new IllegalArgumentException("El pagador no pertenece a este viaje");
        }
    }

    private void validarPuedeRegistrarParaPagador(
            Viaje viaje,
            Usuario pagador,
            String correoAutenticado,
            boolean esAdministrador) {
        if (esAdministrador || viaje.getOrganizador().getCorreo().equals(correoAutenticado)
                || pagador.getCorreo().equals(correoAutenticado)) {
            return;
        }
        throw new AccessDeniedException("No puedes registrar gastos para otro usuario");
    }

    private void validarPuedeModificar(
            Gasto gasto, String correoAutenticado, boolean esAdministrador) {
        if (esAdministrador
                || gasto.getViaje().getOrganizador().getCorreo().equals(correoAutenticado)
                || gasto.getPagador().getCorreo().equals(correoAutenticado)) {
            return;
        }
        throw new AccessDeniedException("No puedes modificar este gasto");
    }

    public Gasto obtenerEntidadPorId(Long id) {

        return gastoRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Gasto no encontrado"));
    }

    private void copiarDatos(
            GastoEntrada entrada,
            Gasto gasto,
            Viaje viaje,
            Usuario pagador) {

        gasto.setViaje(viaje);
        gasto.setPagador(pagador);
        gasto.setConcepto(entrada.getConcepto());
        gasto.setMonto(entrada.getMonto());
        gasto.setFecha(entrada.getFecha());

        if (entrada.getCategoria() == null) {
            gasto.setCategoria(CategoriaGasto.OTRO);
        } else {
            gasto.setCategoria(entrada.getCategoria());
        }
    }

    private GastoRespuesta convertirARespuesta(Gasto gasto) {

        return new GastoRespuesta(
                gasto.getId(),
                gasto.getViaje().getId(),
                gasto.getViaje().getNombre(),
                gasto.getPagador().getId(),
                gasto.getPagador().getNombre(),
                gasto.getConcepto(),
                gasto.getMonto(),
                gasto.getCategoria(),
                gasto.getFecha()
        );
    }
}
