package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.dto.entrada.GastoEntrada;
import com.ruteapp.ruteapp.dto.respuesta.GastoRespuesta;
import com.ruteapp.ruteapp.service.GastoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = "http://localhost:5173")
public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @GetMapping
    public List<GastoRespuesta> listarTodos() {
        return gastoService.listarTodos();
    }

    @GetMapping("/{id}")
    public GastoRespuesta buscarPorId(@PathVariable Long id) {
        return gastoService.buscarPorId(id);
    }

    @GetMapping("/viaje/{viajeId}")
    public List<GastoRespuesta> listarPorViaje(
            @PathVariable Long viajeId) {

        return gastoService.listarPorViaje(viajeId);
    }

    @GetMapping("/pagador/{pagadorId}")
    public List<GastoRespuesta> listarPorPagador(
            @PathVariable Long pagadorId) {

        return gastoService.listarPorPagador(pagadorId);
    }

    @PostMapping
    public GastoRespuesta crear(
            @Valid @RequestBody GastoEntrada entrada) {

        return gastoService.crear(entrada);
    }

    @PutMapping("/{id}")
    public GastoRespuesta actualizar(
            @PathVariable Long id,
            @Valid @RequestBody GastoEntrada entrada) {

        return gastoService.actualizar(id, entrada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        gastoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}