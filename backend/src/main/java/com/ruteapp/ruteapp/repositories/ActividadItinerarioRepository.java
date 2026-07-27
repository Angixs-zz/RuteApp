package com.ruteapp.ruteapp.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ruteapp.ruteapp.model.ActividadItinerario;
import com.ruteapp.ruteapp.model.Viaje;
import com.ruteapp.ruteapp.model.Usuario;

public interface ActividadItinerarioRepository
        extends JpaRepository<ActividadItinerario, Long> {

    List<ActividadItinerario> findByViaje(Viaje viaje);

    List<ActividadItinerario> findByViajeAndResponsable(Viaje viaje, Usuario responsable);
}