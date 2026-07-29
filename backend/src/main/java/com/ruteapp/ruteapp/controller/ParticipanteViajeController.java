package com.ruteapp.ruteapp.controller;

import com.ruteapp.ruteapp.dto.entrada.ParticipanteEntrada;
import com.ruteapp.ruteapp.dto.entrada.RespuestaInvitacionEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ParticipanteRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.WhatsAppRespuesta;
import com.ruteapp.ruteapp.model.EstadoInvitacion;
import com.ruteapp.ruteapp.service.ParticipanteViajeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<List<ParticipanteRespuesta>> listarTodos(
            Authentication authentication) {
        String correoUsuario = esAdministrador(authentication) ? null : authentication.getName();
        return ResponseEntity.ok(participanteViajeService.listarTodos(correoUsuario));
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
    public ResponseEntity<ParticipanteRespuesta> guardar(
            @Valid @RequestBody ParticipanteEntrada entrada,
            Authentication authentication) {
        ParticipanteRespuesta nuevoParticipante =
                participanteViajeService.crear(
                        entrada,
                        authentication.getName(),
                        esAdministrador(authentication)
                );
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

    @PatchMapping("/{id}/respuesta")
    public ResponseEntity<ParticipanteRespuesta> responder(
            @PathVariable Long id,
            @Valid @RequestBody RespuestaInvitacionEntrada entrada,
            Authentication authentication) {
        return ResponseEntity.ok(
                participanteViajeService.responderInvitacion(
                        id,
                        EstadoInvitacion.valueOf(entrada.getRespuesta()),
                        authentication.getName()
                )
        );
    }

    @PostMapping("/{id}/notificar-whatsapp")
    public ResponseEntity<WhatsAppRespuesta> notificarWhatsApp(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(
                participanteViajeService.notificarPorWhatsApp(
                        id,
                        authentication.getName(),
                        esAdministrador(authentication)
                )
        );
    }

    private boolean esAdministrador(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(autoridad -> autoridad.getAuthority().equals("ROLE_ADMINISTRADOR"));
    }
}
