package com.ruteapp.ruteapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.model.ActividadItinerario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ActividadItinerarioRepository;

@Service
public class ActividadItinerarioService {

    private final ActividadItinerarioRepository actividadRepository;

    public ActividadItinerarioService(
            ActividadItinerarioRepository actividadRepository) {
        this.actividadRepository = actividadRepository;
    }

    public List<ActividadItinerario> listarTodos() {
        return actividadRepository.findAll();
    }

    public ActividadItinerario buscarPorId(Long id) {
        return actividadRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Actividad no encontrada"));
    }

    public List<ActividadItinerario> listarPorViaje(Viaje viaje) {
        return actividadRepository.findByViaje(viaje);
    }

    public ActividadItinerario guardar(ActividadItinerario actividad) {
        return actividadRepository.save(actividad);
    }

    public void eliminar(Long id) {
        actividadRepository.deleteById(id);
    }
}
