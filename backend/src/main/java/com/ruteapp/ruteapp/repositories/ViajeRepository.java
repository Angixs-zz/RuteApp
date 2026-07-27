package com.ruteapp.ruteapp.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;

public interface ViajeRepository extends JpaRepository<Viaje, Long> {

    List<Viaje> findByOrganizador(Usuario organizador);

    List<Viaje> findByPublicoTrue();

    Page<Viaje> findByNombreContainingIgnoreCaseOrOrigenContainingIgnoreCaseOrDestinoContainingIgnoreCase(
            String nombre,
            String origen,
            String destino,
            Pageable pageable
    );
}