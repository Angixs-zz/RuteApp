package com.ruteapp.ruteapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.model.Gasto;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.GastoRepository;

@Service
public class GastoService {

    private final GastoRepository gastoRepository;

    public GastoService(GastoRepository gastoRepository) {
        this.gastoRepository = gastoRepository;
    }

    public List<Gasto> listarTodos() {
        return gastoRepository.findAll();
    }

    public Gasto buscarPorId(Long id) {
        return gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado"));
    }

    public List<Gasto> listarPorViaje(Viaje viaje) {
        return gastoRepository.findByViaje(viaje);
    }

    public List<Gasto> listarPorPagador(Usuario pagador) {
        return gastoRepository.findByPagador(pagador);
    }

    public Gasto guardar(Gasto gasto) {
        return gastoRepository.save(gasto);
    }

    public void eliminar(Long id) {
        gastoRepository.deleteById(id);
    }
}
