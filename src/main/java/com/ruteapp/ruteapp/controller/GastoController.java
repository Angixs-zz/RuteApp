package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.model.Gasto;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.service.GastoService;
import com.ruteapp.ruteapp.service.UsuarioService;
import com.ruteapp.ruteapp.service.ViajeService;

@RestController
@RequestMapping("/api/gastos")
public class GastoController {

    private final GastoService gastoService;
    private final ViajeService viajeService;
    private final UsuarioService usuarioService;

    public GastoController(
            GastoService gastoService,
            ViajeService viajeService,
            UsuarioService usuarioService) {

        this.gastoService = gastoService;
        this.viajeService = viajeService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Gasto> listar() {
        return gastoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Gasto buscarPorId(@PathVariable Long id) {
        return gastoService.buscarPorId(id);
    }

    @GetMapping("/viaje/{viajeId}")
    public List<Gasto> listarPorViaje(@PathVariable Long viajeId) {
        Viaje viaje = viajeService.buscarPorId(viajeId);
        return gastoService.listarPorViaje(viaje);
    }

    @GetMapping("/pagador/{usuarioId}")
    public List<Gasto> listarPorPagador(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        return gastoService.listarPorPagador(usuario);
    }

    @PostMapping
    public Gasto crear(@RequestBody Gasto gasto) {
        return gastoService.guardar(gasto);
    }

    @PutMapping("/{id}")
    public Gasto actualizar(
            @PathVariable Long id,
            @RequestBody Gasto gasto) {

        gastoService.buscarPorId(id);
        gasto.setId(id);

        return gastoService.guardar(gasto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        gastoService.buscarPorId(id);
        gastoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}