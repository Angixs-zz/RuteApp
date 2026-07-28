package com.ruteapp.ruteapp.controller;

import com.ruteapp.ruteapp.dto.entrada.ParticipanteEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ParticipanteRespuesta;
import com.ruteapp.ruteapp.service.ParticipanteViajeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participantes")
@CrossOrigin(origins = "http://localhost:5173")
public class ParticipanteViajeController {

    private final ParticipanteViajeService participanteViajeService;

    public ParticipanteViajeController(ParticipanteViajeService participanteViajeService) {
        this.participanteViajeService = participanteViajeService;
    }

    @GetMapping
    public ResponseEntity<List<ParticipanteRespuesta>> listarTodos() {
        return ResponseEntity.ok(participanteViajeService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipanteRespuesta> buscarPorId(@PathVariable Long id) {
        ParticipanteRespuesta participante = participanteViajeService.buscarPorId(id);
        return ResponseEntity.ok(participante);
    }

    @GetMapping("/viaje/{viajeId}")
    public ResponseEntity<List<ParticipanteRespuesta>> listarPorViaje(@PathVariable Long viajeId) {
        List<ParticipanteRespuesta> participantes = participanteViajeService.listarPorViaje(viajeId);
        return ResponseEntity.ok(participantes);
    }

    @PostMapping
    public ResponseEntity<ParticipanteRespuesta> guardar(@Valid @RequestBody ParticipanteEntrada entrada) {
        ParticipanteRespuesta nuevoParticipante = participanteViajeService.crear(entrada);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoParticipante);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        participanteViajeService.eliminar(id);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<ParticipanteRespuesta> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ParticipanteEntrada entrada) {
        ParticipanteRespuesta actualizado = participanteViajeService.actualizar(id, entrada);
        return ResponseEntity.ok(actualizado);
    }
}