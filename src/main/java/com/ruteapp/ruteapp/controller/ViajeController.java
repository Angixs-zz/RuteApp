package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.service.UsuarioService;
import com.ruteapp.ruteapp.service.ViajeService;

@RestController
@RequestMapping("/api/viajes")
public class ViajeController {

    private final ViajeService viajeService;
    private final UsuarioService usuarioService;

    public ViajeController(
            ViajeService viajeService,
            UsuarioService usuarioService) {

        this.viajeService = viajeService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Viaje> listar() {
        return viajeService.listarTodos();
    }

    @GetMapping("/{id}")
    public Viaje buscarPorId(@PathVariable Long id) {
        return viajeService.buscarPorId(id);
    }

    @GetMapping("/publicos")
    public List<Viaje> listarPublicos() {
        return viajeService.listarPublicos();
    }

    @GetMapping("/organizador/{usuarioId}")
    public List<Viaje> listarPorOrganizador(
            @PathVariable Long usuarioId) {

        Usuario organizador = usuarioService.buscarPorId(usuarioId);
        return viajeService.listarPorOrganizador(organizador);
    }

    @PostMapping
    public Viaje crear(@RequestBody Viaje viaje) {
        return viajeService.guardar(viaje);
    }

    @PutMapping("/{id}")
    public Viaje actualizar(
            @PathVariable Long id,
            @RequestBody Viaje viaje) {

        viajeService.buscarPorId(id);
        viaje.setId(id);

        return viajeService.guardar(viaje);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        viajeService.buscarPorId(id);
        viajeService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}