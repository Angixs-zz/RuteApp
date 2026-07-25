package com.ruteapp.ruteapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.repositories.ParticipanteViajeRepository;

@Service
public class ParticipanteViajeService {

    private final ParticipanteViajeRepository participanteViajeRepository;

    public ParticipanteViajeService(
            ParticipanteViajeRepository participanteViajeRepository) {
        this.participanteViajeRepository = participanteViajeRepository;
    }

    public List<ParticipanteViaje> listarTodos() {
        return participanteViajeRepository.findAll();
    }

    public ParticipanteViaje buscarPorId(Long id) {
        return participanteViajeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Participante no encontrado"));
    }

    public List<ParticipanteViaje> listarPorUsuario(Usuario usuario) {
        return participanteViajeRepository.findByUsuario(usuario);
    }

    public List<ParticipanteViaje> listarPorViaje(Viaje viaje) {
        return participanteViajeRepository.findByViaje(viaje);
    }

    public ParticipanteViaje buscarPorUsuarioYViaje(
            Usuario usuario,
            Viaje viaje) {

        return participanteViajeRepository
                .findByUsuarioAndViaje(usuario, viaje)
                .orElseThrow(() ->
                        new RuntimeException("Participante no encontrado"));
    }

    public ParticipanteViaje guardar(ParticipanteViaje participante) {
        return participanteViajeRepository.save(participante);
    }

    public void eliminar(Long id) {
        participanteViajeRepository.deleteById(id);
    }
}
