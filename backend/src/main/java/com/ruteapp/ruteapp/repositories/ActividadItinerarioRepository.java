package com.ruteapp.ruteapp.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ruteapp.ruteapp.model.ActividadItinerario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.model.Usuario;

public interface ActividadItinerarioRepository
        extends JpaRepository<ActividadItinerario, Long> {

    List<ActividadItinerario> findByViaje(Viaje viaje);

    List<ActividadItinerario> findByViajeAndResponsable(Viaje viaje, Usuario responsable);

    @Query("""
            SELECT a FROM ActividadItinerario a WHERE
            (:busqueda = '' OR LOWER(a.lugar) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(a.viaje.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(a.responsable.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')))
            AND (:estado = '' OR a.estado = :estado)
            """)
    Page<ActividadItinerario> buscar(@Param("busqueda") String busqueda, @Param("estado") String estado, Pageable pageable);
}
