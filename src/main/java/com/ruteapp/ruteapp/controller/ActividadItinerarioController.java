package com.ruteapp.ruteapp.controller;

import com.ruteapp.ruteapp.dto.entrada.ActividadEntrada;
import com.ruteapp.ruteapp.model.ActividadItinerario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.service.ActividadItinerarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividades")
public class ActividadItinerarioController {

    private final ActividadItinerarioService actividadService;

    public ActividadItinerarioController(ActividadItinerarioService actividadService) {
        this.actividadService = actividadService;
    }

    // GET: Listar todas las actividades de la plataforma
    @GetMapping
    public ResponseEntity<List<ActividadItinerario>> listarTodas() {
        return ResponseEntity.ok(actividadService.listarTodos());
    }

    // GET: Buscar actividad por ID
    @GetMapping("/{id}")
    public ResponseEntity<ActividadItinerario> buscarPorId(@PathVariable Long id) {
        ActividadItinerario actividad = actividadService.buscarPorId(id);
        return ResponseEntity.ok(actividad);
    }

    // GET: Listar actividades por ID de viaje
    @GetMapping("/viaje/{viajeId}")
    public ResponseEntity<List<ActividadItinerario>> listarPorViaje(@PathVariable Long viajeId) {
        Viaje viaje = new Viaje();
        viaje.setId(viajeId);
        List<ActividadItinerario> actividades = actividadService.listarPorViaje(viaje);
        return ResponseEntity.ok(actividades);
    }

    // POST: Crear una nueva actividad validando con @Valid
    @PostMapping
    public ResponseEntity<ActividadItinerario> guardar(@Valid @RequestBody ActividadEntrada entrada) {
        ActividadItinerario actividad = new ActividadItinerario();

        Viaje viaje = new Viaje();
        viaje.setId(entrada.getViajeId());
        actividad.setViaje(viaje);

        actividad.setLugar(entrada.getLugar());
        actividad.setHorario(entrada.getHorario());
        actividad.setDescripcion(entrada.getDescripcion());
        actividad.setResponsable(entrada.getResponsable());
        actividad.setCostoEstimado(entrada.getCostoEstimado());
        
        if (entrada.getEstado() != null) {
            actividad.setEstado(entrada.getEstado());
        }

        ActividadItinerario nuevaActividad = actividadService.guardar(actividad);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaActividad);
    }

    // DELETE: Eliminar una actividad
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        actividadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}