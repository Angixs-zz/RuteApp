package com.ruteapp.ruteapp.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.model.Usuario;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey clave;
    private final long duracionToken;

    public JwtService(
            @Value("${jwt.secret}") String secreto,
            @Value("${jwt.expiration}") long duracionToken) {

        // Convertimos nuestra clave de texto en una clave que JWT pueda usar
        this.clave = Keys.hmacShaKeyFor(
                secreto.getBytes(StandardCharsets.UTF_8)
        );

        this.duracionToken = duracionToken;
    }

    public String generarToken(Usuario usuario) {

        Date ahora = new Date();
        Date vencimiento = new Date(
                ahora.getTime() + duracionToken
        );

        return Jwts.builder()
                .subject(usuario.getCorreo())
                .claim("usuarioId", usuario.getId())
                .claim("nombre", usuario.getNombre())
                .claim("rol", usuario.getRol().getNombre())
                .issuedAt(ahora)
                .expiration(vencimiento)
                .signWith(clave)
                .compact();
    }
}
