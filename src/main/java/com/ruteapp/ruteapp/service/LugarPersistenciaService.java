package com.ruteapp.ruteapp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruteapp.ruteapp.dto.entrada.LugarEntrada;
import com.ruteapp.ruteapp.dto.respuesta.LugarRespuesta;
import com.ruteapp.ruteapp.model.Lugar;
import com.ruteapp.ruteapp.repositories.LugarRepository;

@Service
public class LugarPersistenciaService {

    private final LugarRepository lugarRepository;

    public LugarPersistenciaService(LugarRepository lugarRepository) {
        this.lugarRepository = lugarRepository;
    }

    @Transactional
    public Lugar obtenerOCrear(LugarEntrada entrada) {
        return lugarRepository.findByPlaceId(entrada.getPlaceId())
                .map(lugar -> actualizarDatos(lugar, entrada))
                .orElseGet(() -> crear(entrada));
    }

    public LugarRespuesta convertirARespuesta(Lugar lugar) {
        if (lugar == null) {
            return null;
        }

        return new LugarRespuesta(
                lugar.getId(),
                lugar.getPlaceId(),
                lugar.getNombre(),
                lugar.getDireccionFormateada(),
                lugar.getCiudad(),
                lugar.getEstado(),
                lugar.getPais(),
                lugar.getLatitud(),
                lugar.getLongitud()
        );
    }

    private Lugar crear(LugarEntrada entrada) {
        Lugar lugar = new Lugar();
        copiarDatos(entrada, lugar);
        return lugarRepository.save(lugar);
    }

    private Lugar actualizarDatos(Lugar lugar, LugarEntrada entrada) {
        copiarDatos(entrada, lugar);
        return lugarRepository.save(lugar);
    }

    private void copiarDatos(LugarEntrada entrada, Lugar lugar) {
        lugar.setPlaceId(entrada.getPlaceId());
        lugar.setNombre(entrada.getNombre());
        lugar.setDireccionFormateada(entrada.getDireccionFormateada());
        lugar.setCiudad(entrada.getCiudad());
        lugar.setEstado(entrada.getEstado());
        lugar.setPais(entrada.getPais());
        lugar.setLatitud(entrada.getLatitud());
        lugar.setLongitud(entrada.getLongitud());
    }
}
