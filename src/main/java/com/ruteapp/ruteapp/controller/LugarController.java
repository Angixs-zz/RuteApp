package com.ruteapp.ruteapp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ruteapp.ruteapp.dto.respuesta.LugarSugerenciaRespuesta;
import com.ruteapp.ruteapp.service.LugarService;

@RestController
@RequestMapping("/api/lugares")
public class LugarController {

    private final LugarService lugarService;

    public LugarController(LugarService lugarService) {
        this.lugarService = lugarService;
    }

    @GetMapping("/autocompletar")
    public List<LugarSugerenciaRespuesta> autocompletar(
            @RequestParam String texto
    ) {
        return lugarService.autocompletar(texto);
    }
}
