package com.ruteapp.ruteapp.controller;

import com.ruteapp.ruteapp.dto.entrada.RolEntrada;
import com.ruteapp.ruteapp.model.Rol;
import com.ruteapp.ruteapp.service.RolService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping
    public ResponseEntity<List<Rol>> listarTodos() {
        return ResponseEntity.ok(rolService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rol> buscarPorId(@PathVariable Long id) {
        Rol rol = rolService.buscarPorId(id);
        return ResponseEntity.ok(rol);
    }

    @PostMapping
    public ResponseEntity<Rol> guardar(@Valid @RequestBody RolEntrada entrada) {
        Rol rol = new Rol();
        rol.setNombre(entrada.getNombre());
        Rol nuevoRol = rolService.guardar(rol);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRol);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        rolService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}