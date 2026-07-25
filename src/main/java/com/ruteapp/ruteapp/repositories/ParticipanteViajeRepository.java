package com.ruteapp.ruteapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ruteapp.ruteapp.model.ParticipanteViaje;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;

public interface ParticipanteViajeRepository
        extends JpaRepository<ParticipanteViaje, Long> {

    List<ParticipanteViaje> findByUsuario(Usuario usuario);

    List<ParticipanteViaje> findByViaje(Viaje viaje);

    Optional<ParticipanteViaje> findByUsuarioAndViaje(
            Usuario usuario,
            Viaje viaje
    );
}
