package com.ruteapp.ruteapp.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication
        .UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority
        .SimpleGrantedAuthority;
import org.springframework.security.core.context
        .SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ruteapp.ruteapp.repositories.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class FiltroDeAutenticacionJwt
        extends OncePerRequestFilter {

    private final ServicioGestionTokensJwt jwtService;
    private final UsuarioRepository usuarioRepository;

    public FiltroDeAutenticacionJwt(
            ServicioGestionTokensJwt jwtService,
            UsuarioRepository usuarioRepository) {

        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String encabezado =
                request.getHeader("Authorization");

        /*
         * Si no hay token, no autenticamos al usuario.
         * Spring decidirá después si la ruta es pública
         * o si debe regresar 401.
         */
        if (encabezado == null
                || !encabezado.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = encabezado.substring(7);

        if (!jwtService.esTokenValido(token)) {

            filterChain.doFilter(request, response);
            return;
        }

        String correo =
                jwtService.extraerCorreo(token);

        var usuario = usuarioRepository.findByCorreo(correo)
                .filter(usuarioEncontrado -> Boolean.TRUE.equals(usuarioEncontrado.getActivo()))
                .orElse(null);
        if (usuario == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String rol = usuario.getRol().getNombre();

        SimpleGrantedAuthority autoridad =
                new SimpleGrantedAuthority(
                        "ROLE_" + rol
                );

        UsernamePasswordAuthenticationToken autenticacion =
                new UsernamePasswordAuthenticationToken(
                        correo,
                        null,
                        List.of(autoridad)
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(autenticacion);

        filterChain.doFilter(request, response);
    }
}
