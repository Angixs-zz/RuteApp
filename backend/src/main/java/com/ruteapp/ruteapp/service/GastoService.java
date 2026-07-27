package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.dto.entrada.GastoEntrada;
import com.ruteapp.ruteapp.dto.respuesta.GastoRespuesta;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.CategoriaGasto;
import com.ruteapp.ruteapp.model.Gasto;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.GastoRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.repositories.ViajeRepository;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;
    private final ViajeRepository viajeRepository;
    private final UsuarioRepository usuarioRepository;

    public GastoService(
            GastoRepository gastoRepository,
            ViajeRepository viajeRepository,
            UsuarioRepository usuarioRepository) {

        this.gastoRepository = gastoRepository;
        this.viajeRepository = viajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<GastoRespuesta> listarTodos() {

        List<Gasto> gastos = gastoRepository.findAll();
        List<GastoRespuesta> respuestas = new ArrayList<>();

        for (Gasto gasto : gastos) {
            respuestas.add(convertirARespuesta(gasto));
        }

        return respuestas;
    }

    public GastoRespuesta buscarPorId(Long id) {

        Gasto gasto = obtenerEntidadPorId(id);

        return convertirARespuesta(gasto);
    }

    public List<GastoRespuesta> listarPorViaje(Long viajeId) {

        Viaje viaje = viajeRepository.findById(viajeId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Viaje no encontrado"));

        List<Gasto> gastos = gastoRepository.findByViaje(viaje);
        List<GastoRespuesta> respuestas = new ArrayList<>();

        for (Gasto gasto : gastos) {
            respuestas.add(convertirARespuesta(gasto));
        }

        return respuestas;
    }

    public List<GastoRespuesta> listarPorPagador(Long pagadorId) {

        Usuario pagador = usuarioRepository.findById(pagadorId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario no encontrado"));

        List<Gasto> gastos = gastoRepository.findByPagador(pagador);
        List<GastoRespuesta> respuestas = new ArrayList<>();

        for (Gasto gasto : gastos) {
            respuestas.add(convertirARespuesta(gasto));
        }

        return respuestas;
    }

    public GastoRespuesta crear(GastoEntrada entrada) {

        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Viaje no encontrado"));

        Usuario pagador = usuarioRepository.findById(entrada.getPagadorId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario pagador no encontrado"));

        Gasto gasto = new Gasto();

        copiarDatos(entrada, gasto, viaje, pagador);

        Gasto guardado = gastoRepository.save(gasto);

        return convertirARespuesta(guardado);
    }

    public GastoRespuesta actualizar(
            Long id,
            GastoEntrada entrada) {

        Gasto gasto = obtenerEntidadPorId(id);

        Viaje viaje = viajeRepository.findById(entrada.getViajeId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Viaje no encontrado"));

        Usuario pagador = usuarioRepository.findById(entrada.getPagadorId())
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario pagador no encontrado"));

        copiarDatos(entrada, gasto, viaje, pagador);

        Gasto actualizado = gastoRepository.save(gasto);

        return convertirARespuesta(actualizado);
    }

    public void eliminar(Long id) {

        Gasto gasto = obtenerEntidadPorId(id);

        gastoRepository.delete(gasto);
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