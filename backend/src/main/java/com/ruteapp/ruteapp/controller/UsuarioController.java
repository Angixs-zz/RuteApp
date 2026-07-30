package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.dto.entrada.UsuarioEntrada;
import com.ruteapp.ruteapp.dto.entrada.UsuarioAdminEntrada;
import com.ruteapp.ruteapp.dto.entrada.ActualizarPerfilEntrada;
import com.ruteapp.ruteapp.dto.respuesta.UsuarioRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.PaginaRespuesta;
import com.ruteapp.ruteapp.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioRespuesta> listar() {
        return usuarioService.listarTodos();
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/paginados")
    public PaginaRespuesta<UsuarioRespuesta> listarPaginados(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String busqueda, @RequestParam(required = false) String rol, @RequestParam(required = false) Boolean activo) {
        return usuarioService.listarPaginados(page, size, busqueda, rol, activo);
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

        return usuarioService.crearPublico(entrada);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/admin")
    public UsuarioRespuesta crearComoAdmin(@Valid @RequestBody UsuarioEntrada entrada) {
        return usuarioService.crear(entrada);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public UsuarioRespuesta actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioEntrada entrada) {

        return usuarioService.actualizar(id, entrada);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}/admin")
    public UsuarioRespuesta actualizarComoAdmin(@PathVariable Long id, @Valid @RequestBody UsuarioAdminEntrada entrada) {
        return usuarioService.actualizarComoAdmin(id, entrada);
    }

    @PreAuthorize(
        "hasRole('ADMINISTRADOR') or " +
        "@usuarioPermisos.esMismoUsuario(#id, authentication)"
    )
    @PatchMapping("/{id}/perfil")
    public UsuarioRespuesta actualizarPerfil(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPerfilEntrada entrada) {
        return usuarioService.actualizarPerfil(id, entrada);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
