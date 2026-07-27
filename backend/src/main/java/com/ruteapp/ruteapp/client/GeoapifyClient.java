package com.ruteapp.ruteapp.client;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.ruteapp.ruteapp.dto.respuesta.LugarSugerenciaRespuesta;

@Component
public class GeoapifyClient {

    private final RestClient restClient;
    private final String apiKey;

    public GeoapifyClient(
            RestClient.Builder restClientBuilder,
            @Value("${geoapify.base-url}") String baseUrl,
            @Value("${geoapify.api-key}") String apiKey
    ) {
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .build();

        this.apiKey = apiKey;
    }

    public List<LugarSugerenciaRespuesta> autocompletar(String texto) {
        Map<String, Object> respuesta = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/geocode/autocomplete")
                        .queryParam("text", texto)
                        .queryParam("type", "city")
                        .queryParam("filter", "countrycode:mx")
                        .queryParam("lang", "es")
                        .queryParam("limit", 5)
                        .queryParam("format", "json")
                        .queryParam("apiKey", apiKey)
                        .build())
                .retrieve()
                .body(Map.class);

        return convertirResultados(respuesta);
    }

    @SuppressWarnings("unchecked")
    private List<LugarSugerenciaRespuesta> convertirResultados(
            Map<String, Object> respuesta
    ) {
        if (respuesta == null || respuesta.get("results") == null) {
            return List.of();
        }

        List<Map<String, Object>> resultados =
                (List<Map<String, Object>>) respuesta.get("results");

        List<LugarSugerenciaRespuesta> sugerencias = new ArrayList<>();

        for (Map<String, Object> resultado : resultados) {
            sugerencias.add(new LugarSugerenciaRespuesta(
                    obtenerTexto(resultado, "place_id"),
                    obtenerTexto(resultado, "name"),
                    obtenerTexto(resultado, "formatted"),
                    obtenerTexto(resultado, "city"),
                    obtenerTexto(resultado, "state"),
                    obtenerTexto(resultado, "country"),
                    obtenerNumero(resultado, "lat"),
                    obtenerNumero(resultado, "lon")
            ));
        }

        return sugerencias;
    }

    private String obtenerTexto(
            Map<String, Object> resultado,
            String campo
    ) {
        Object valor = resultado.get(campo);
        return valor != null ? valor.toString() : null;
    }

    private Double obtenerNumero(
            Map<String, Object> resultado,
            String campo
    ) {
        Object valor = resultado.get(campo);

        if (valor instanceof Number numero) {
            return numero.doubleValue();
        }

        return null;
    }
}
