package com.ruteapp.ruteapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ruteapp.ruteapp.dto.entrada.WhatsAppEntrada;
import com.ruteapp.ruteapp.dto.respuesta.WhatsAppRespuesta;
import com.ruteapp.ruteapp.service.WhatsAppService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comunicaciones")
public class ComunicacionController {

    private final WhatsAppService whatsAppService;

    public ComunicacionController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    @PostMapping("/whatsapp")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'USUARIO', 'AGENCIA')")
    public ResponseEntity<WhatsAppRespuesta> enviarWhatsApp(
            @Valid @RequestBody WhatsAppEntrada entrada) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(whatsAppService.enviar(entrada));
    }
}
