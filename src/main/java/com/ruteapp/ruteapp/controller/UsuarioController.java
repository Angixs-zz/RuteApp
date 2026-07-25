package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public Usuario buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }

    @GetMapping("/correo/{correo}")
    public Usuario buscarPorCorreo(@PathVariable String correo) {
        return usuarioService.buscarPorCorreo(correo);
    }

    @PostMapping
    public Usuario crear(@RequestBody Usuario usuario) {
        return usuarioService.guardar(usuario);
    }

    @PutMapping("/{id}")
    public Usuario actualizar(
            @PathVariable Long id,
            @RequestBody Usuario usuario) {

        usuarioService.buscarPorId(id);
        usuario.setId(id);

        return usuarioService.guardar(usuario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.buscarPorId(id);
        usuarioService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}