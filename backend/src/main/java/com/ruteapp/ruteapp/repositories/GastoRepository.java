package com.ruteapp.ruteapp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ruteapp.ruteapp.model.Gasto;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.model.CategoriaGasto;

public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByViaje(Viaje viaje);

    List<Gasto> findByPagador(Usuario pagador);

    @Query("""
            SELECT g FROM Gasto g WHERE
            (:busqueda = '' OR LOWER(g.concepto) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(g.viaje.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(g.pagador.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')))
            AND (:categoria IS NULL OR g.categoria = :categoria)
            """)
    Page<Gasto> buscar(@Param("busqueda") String busqueda, @Param("categoria") CategoriaGasto categoria, Pageable pageable);
}
