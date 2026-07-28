package com.ruteapp.ruteapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ruteapp.ruteapp.dto.entrada.GoogleLoginEntrada;
import com.ruteapp.ruteapp.dto.entrada.LoginEntrada;
import com.ruteapp.ruteapp.dto.entrada.RestablecerPasswordEntrada;
import com.ruteapp.ruteapp.dto.entrada.SolicitudRecuperacionEntrada;
import com.ruteapp.ruteapp.dto.respuesta.LoginRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.MensajeRespuesta;
import com.ruteapp.ruteapp.service.AuthService;
import com.ruteapp.ruteapp.service.RecuperacionPasswordService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RecuperacionPasswordService recuperacionPasswordService;

    public AuthController(
            AuthService authService,
            RecuperacionPasswordService recuperacionPasswordService) {
        this.authService = authService;
        this.recuperacionPasswordService = recuperacionPasswordService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginRespuesta> login(@Valid @RequestBody LoginEntrada entrada) {
        return ResponseEntity.ok(authService.login(entrada));
    }

    @PostMapping("/google")
    public ResponseEntity<LoginRespuesta> loginGoogle(
            @Valid @RequestBody GoogleLoginEntrada entrada) {
        return ResponseEntity.ok(authService.loginGoogle(entrada.getCredential()));
    }

    @PostMapping("/recuperacion/solicitar")
    public ResponseEntity<MensajeRespuesta> solicitarRecuperacion(
            @Valid @RequestBody SolicitudRecuperacionEntrada entrada) {
        return ResponseEntity.ok(recuperacionPasswordService.solicitar(entrada));
    }

    @PostMapping("/recuperacion/restablecer")
    public ResponseEntity<MensajeRespuesta> restablecerPassword(
            @Valid @RequestBody RestablecerPasswordEntrada entrada) {
        return ResponseEntity.ok(recuperacionPasswordService.restablecer(entrada));
    }
}
