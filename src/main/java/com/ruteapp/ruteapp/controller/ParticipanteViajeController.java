package com.ruteapp.ruteapp.controller;

import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.service.ParticipanteViajeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participantes")
public class ParticipanteViajeController {

    private final ParticipanteViajeService participanteViajeService;

    public ParticipanteViajeController(ParticipanteViajeService participanteViajeService) {
        this.participanteViajeService = participanteViajeService;
    }

    // GET: Listar todos los participantes de la plataforma
    @GetMapping
    public ResponseEntity<List<ParticipanteViaje>> listarTodos() {
        return ResponseEntity.ok(participanteViajeService.listarTodos());
    }

    // GET: Buscar participante por ID
    @GetMapping("/{id}")
    public ResponseEntity<ParticipanteViaje> buscarPorId(@PathVariable Long id) {
        ParticipanteViaje participante = participanteViajeService.buscarPorId(id);
        return ResponseEntity.ok(participante);
    }

    // GET: Listar participantes por ID de viaje
    @GetMapping("/viaje/{viajeId}")
    public ResponseEntity<List<ParticipanteViaje>> listarPorViaje(@PathVariable Long viajeId) {
        Viaje viaje = new Viaje();
        viaje.setId(viajeId);
        List<ParticipanteViaje> participantes = participanteViajeService.listarPorViaje(viaje);
        return ResponseEntity.ok(participantes);
    }

    // POST: Registrar / invitar un nuevo participante a un viaje
    @PostMapping
    public ResponseEntity<ParticipanteViaje> guardar(@RequestBody ParticipanteViaje participante) {
        ParticipanteViaje nuevoParticipante = participanteViajeService.guardar(participante);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoParticipante);
    }

    // DELETE: Eliminar un participante del viaje
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        participanteViajeService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

