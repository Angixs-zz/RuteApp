package com.ruteapp.ruteapp.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.ruteapp.ruteapp.repositories.UsuarioRepository;

@Component("usuarioPermisos")
public class UsuarioPermisos {

    private final UsuarioRepository usuarioRepository;

    public UsuarioPermisos(
            UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public boolean esMismoUsuario(
            Long usuarioId,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return false;
        }

        String correoAutenticado =
                authentication.getName();

        return usuarioRepository
                .findByCorreo(correoAutenticado)
                .map(usuario ->
                        usuario.getId().equals(usuarioId)
                )
                .orElse(false);
    }
}
