package com.ruteapp.ruteapp.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ruteapp.ruteapp.model.Lugar;

public interface LugarRepository extends JpaRepository<Lugar, Long> {

    Optional<Lugar> findByPlaceId(String placeId);
}
