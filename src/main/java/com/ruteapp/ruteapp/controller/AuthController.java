package com.ruteapp.ruteapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ruteapp.ruteapp.dto.entrada.LoginEntrada;
import com.ruteapp.ruteapp.dto.respuesta.LoginRespuesta;
import com.ruteapp.ruteapp.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginRespuesta> login(
            @Valid @RequestBody LoginEntrada entrada) {

        return ResponseEntity.ok(
                authService.login(entrada)
        );
    }
}
