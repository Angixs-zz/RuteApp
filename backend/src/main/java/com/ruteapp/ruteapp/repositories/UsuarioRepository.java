package com.ruteapp.ruteapp.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ruteapp.ruteapp.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    Optional<Usuario> findByGoogleSubject(String googleSubject);

    boolean existsByCorreo(String correo);
}
