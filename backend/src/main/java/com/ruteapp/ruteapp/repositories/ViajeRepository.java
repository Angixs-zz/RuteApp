package com.ruteapp.ruteapp.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @EntityGraph(attributePaths = {"organizador", "origenLugar", "destinoLugar"})
    @Query("""
            SELECT v
            FROM Viaje v
            WHERE v.organizador.correo = :correo
              AND (
                    :busqueda = ''
                    OR LOWER(v.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                    OR LOWER(v.origen) LIKE LOWER(CONCAT('%', :busqueda, '%'))
                    OR LOWER(v.destino) LIKE LOWER(CONCAT('%', :busqueda, '%'))
              )
            """)
    Page<Viaje> buscarPorOrganizador(
            @Param("correo") String correo,
            @Param("busqueda") String busqueda,
            Pageable pageable
    );
}
