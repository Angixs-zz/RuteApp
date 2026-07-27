package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.dto.entrada.ViajeEntrada;
import com.ruteapp.ruteapp.dto.respuesta.ViajeRespuesta;
import com.ruteapp.ruteapp.service.ViajeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/viajes")
public class ViajeController {

    private final ViajeService viajeService;

    public ViajeController(ViajeService viajeService) {
        this.viajeService = viajeService;
    }

    @GetMapping
    public List<ViajeRespuesta> listar() {
        return viajeService.listarTodos();
    }

    @GetMapping("/{id}")
    public ViajeRespuesta buscarPorId(@PathVariable Long id) {
        return viajeService.buscarPorId(id);
    }

    @GetMapping("/publicos")
    public List<ViajeRespuesta> listarPublicos() {
        return viajeService.listarPublicos();
    }

    @GetMapping("/organizador/{usuarioId}")
    public List<ViajeRespuesta> listarPorOrganizador(
            @PathVariable Long usuarioId) {

        return viajeService.listarPorOrganizador(usuarioId);
    }

    @PostMapping
    public ViajeRespuesta crear(
            @Valid @RequestBody ViajeEntrada entrada) {

        return viajeService.crear(entrada);
    }

    @PutMapping("/{id}")
    public ViajeRespuesta actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ViajeEntrada entrada) {

        return viajeService.actualizar(id, entrada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        viajeService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}