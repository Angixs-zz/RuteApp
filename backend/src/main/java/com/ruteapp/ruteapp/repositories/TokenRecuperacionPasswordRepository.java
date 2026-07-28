package com.ruteapp.ruteapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ruteapp.ruteapp.model.TokenRecuperacionPassword;
import com.ruteapp.ruteapp.model.Usuario;

public interface TokenRecuperacionPasswordRepository extends JpaRepository<TokenRecuperacionPassword, Long> {

    Optional<TokenRecuperacionPassword> findByTokenHashAndUsadoFalse(String tokenHash);

    List<TokenRecuperacionPassword> findByUsuarioAndUsadoFalse(Usuario usuario);
}
