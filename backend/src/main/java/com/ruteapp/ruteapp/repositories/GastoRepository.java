package com.ruteapp.ruteapp.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ruteapp.ruteapp.model.Gasto;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.model.Viaje;

public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByViaje(Viaje viaje);

    List<Gasto> findByPagador(Usuario pagador);
}