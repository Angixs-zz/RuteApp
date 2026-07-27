package com.ruteapp.ruteapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.client.GeoapifyClient;
import com.ruteapp.ruteapp.dto.respuesta.LugarSugerenciaRespuesta;

@Service
public class LugarService {

    private final GeoapifyClient geoapifyClient;

    public LugarService(GeoapifyClient geoapifyClient) {
        this.geoapifyClient = geoapifyClient;
    }

    public List<LugarSugerenciaRespuesta> autocompletar(String texto) {
        String textoLimpio = texto == null ? "" : texto.trim();

        if (textoLimpio.length() < 3) {
            throw new IllegalArgumentException(
                    "La búsqueda debe contener al menos 3 caracteres"
            );
        }

        return geoapifyClient.autocompletar(textoLimpio);
    }
}
