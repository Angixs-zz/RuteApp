package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.dto.entrada.UsuarioEntrada;
import com.ruteapp.ruteapp.dto.respuesta.UsuarioRespuesta;
import com.ruteapp.ruteapp.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioRespuesta> listar() {
        return usuarioService.listarTodos();
    }

    @PreAuthorize(
        "hasRole('ADMINISTRADOR') or " +
        "@usuarioPermisos.esMismoUsuario(#id, authentication)"
    )
    @GetMapping("/{id}")
    public UsuarioRespuesta buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/correo/{correo}")
    public UsuarioRespuesta buscarPorCorreo(@PathVariable String correo) {
        return usuarioService.buscarPorCorreo(correo);
    }

    @PostMapping
    public UsuarioRespuesta crear(
            @Valid @RequestBody UsuarioEntrada entrada) {

        return usuarioService.crear(entrada);
    }

    @PreAuthorize(
        "hasRole('ADMINISTRADOR') or " +
        "@usuarioPermisos.esMismoUsuario(#id, authentication)"
    )
    @PutMapping("/{id}")
    public UsuarioRespuesta actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioEntrada entrada) {

        return usuarioService.actualizar(id, entrada);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}