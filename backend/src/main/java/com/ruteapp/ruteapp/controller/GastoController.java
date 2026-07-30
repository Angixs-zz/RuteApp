package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ruteapp.ruteapp.dto.entrada.GastoEntrada;
import com.ruteapp.ruteapp.dto.respuesta.GastoRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.PaginaRespuesta;
import com.ruteapp.ruteapp.model.CategoriaGasto;
import com.ruteapp.ruteapp.service.GastoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/gastos")
public class GastoController {

    private final GastoService gastoService;

    public GastoController(GastoService gastoService) {
        this.gastoService = gastoService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<GastoRespuesta> listarTodos() {
        return gastoService.listarTodos();
    }

    @GetMapping("/paginados")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public PaginaRespuesta<GastoRespuesta> listarPaginados(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String busqueda, @RequestParam(required = false) CategoriaGasto categoria) {
        return gastoService.listarPaginados(page, size, busqueda, categoria);
    }

    @GetMapping("/{id}")
    public GastoRespuesta buscarPorId(@PathVariable Long id, Authentication authentication) {
        return gastoService.buscarPorId(
                id, authentication.getName(), esAdministrador(authentication));
    }

    @GetMapping("/viaje/{viajeId}")
    public List<GastoRespuesta> listarPorViaje(
            @PathVariable Long viajeId,
            Authentication authentication) {

        return gastoService.listarPorViaje(
                viajeId, authentication.getName(), esAdministrador(authentication));
    }

    @GetMapping("/pagador/{pagadorId}")
    public List<GastoRespuesta> listarPorPagador(
            @PathVariable Long pagadorId,
            Authentication authentication) {

        return gastoService.listarPorPagador(
                pagadorId, authentication.getName(), esAdministrador(authentication));
    }

    @PostMapping
    public GastoRespuesta crear(
            @Valid @RequestBody GastoEntrada entrada,
            Authentication authentication) {

        return gastoService.crear(
                entrada, authentication.getName(), esAdministrador(authentication));
    }

    @PutMapping("/{id}")
    public GastoRespuesta actualizar(
            @PathVariable Long id,
            @Valid @RequestBody GastoEntrada entrada,
            Authentication authentication) {

        return gastoService.actualizar(
                id, entrada, authentication.getName(), esAdministrador(authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication authentication) {

        gastoService.eliminar(id, authentication.getName(), esAdministrador(authentication));

        return ResponseEntity.noContent().build();
    }

    private boolean esAdministrador(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(autoridad -> autoridad.getAuthority().equals("ROLE_ADMINISTRADOR"));
    }
}
