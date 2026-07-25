package com.ruteapp.ruteapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ViajeRepository;

@Service
public class ViajeService {

    private final ViajeRepository viajeRepository;

    public ViajeService(ViajeRepository viajeRepository) {
        this.viajeRepository = viajeRepository;
    }

    public List<Viaje> listarTodos() {
        return viajeRepository.findAll();
    }

    public Viaje buscarPorId(Long id) {
        return viajeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viaje no encontrado"));
    }

    public List<Viaje> listarPorOrganizador(Usuario organizador) {
        return viajeRepository.findByOrganizador(organizador);
    }

    public List<Viaje> listarPublicos() {
        return viajeRepository.findByPublicoTrue();
    }

    public Viaje guardar(Viaje viaje) {
        return viajeRepository.save(viaje);
    }

    public void eliminar(Long id) {
        viajeRepository.deleteById(id);
    }
}
