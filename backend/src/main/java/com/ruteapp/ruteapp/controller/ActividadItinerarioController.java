package com.ruteapp.ruteapp.controller;

import com.ruteapp.ruteapp.dto.entrada.ActividadEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ActividadRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.PaginaRespuesta;
import com.ruteapp.ruteapp.service.ActividadItinerarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividades")
@CrossOrigin(origins = "http://localhost:5173")
public class ActividadItinerarioController {

    private final ActividadItinerarioService actividadService;

    public ActividadItinerarioController(ActividadItinerarioService actividadService) {
        this.actividadService = actividadService;
    }

    // GET: Listar todas las actividades de la plataforma
    @GetMapping
    public ResponseEntity<List<ActividadRespuesta>> listarTodas() {
        return ResponseEntity.ok(actividadService.listarTodos());
    }

    @GetMapping("/paginadas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public PaginaRespuesta<ActividadRespuesta> listarPaginadas(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String busqueda, @RequestParam(required = false) String estado) {
        return actividadService.listarPaginados(page, size, busqueda, estado);
    }

    // GET: Buscar actividad por ID
    @GetMapping("/{id}")
    public ResponseEntity<ActividadRespuesta> buscarPorId(@PathVariable Long id) {
        ActividadRespuesta actividad = actividadService.buscarPorId(id);
        return ResponseEntity.ok(actividad);
    }

    // GET: Listar actividades por ID de viaje
    @GetMapping("/viaje/{viajeId}")
    public ResponseEntity<List<ActividadRespuesta>> listarPorViaje(@PathVariable Long viajeId) {
        List<ActividadRespuesta> actividades = actividadService.listarPorViajeId(viajeId);
        return ResponseEntity.ok(actividades);
    }

    // POST: Crear una nueva actividad validando con @Valid
    @PostMapping
    public ResponseEntity<ActividadRespuesta> guardar(@Valid @RequestBody ActividadEntrada entrada) {
        ActividadRespuesta nuevaActividad = actividadService.crear(entrada);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaActividad);
    }

    // DELETE: Eliminar una actividad
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication authentication) {
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(autoridad -> autoridad.getAuthority().equals("ROLE_ADMINISTRADOR"));
        actividadService.eliminar(id, authentication.getName(), esAdmin);
        return ResponseEntity.noContent().build();
    }


    // PUT: Actualizar una actividad existente
    @PutMapping("/{id}")
    public ResponseEntity<ActividadRespuesta> actualizar(
            @PathVariable Long id, 
            @Valid @RequestBody ActividadEntrada entrada) {
        ActividadRespuesta actividadActualizada = actividadService.actualizar(id, entrada);
        return ResponseEntity.ok(actividadActualizada);
    }
}
