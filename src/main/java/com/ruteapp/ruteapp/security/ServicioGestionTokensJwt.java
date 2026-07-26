package com.ruteapp.ruteapp.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.model.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class ServicioGestionTokensJwt {

    private final SecretKey clave;
    private final long duracionToken;

    public ServicioGestionTokensJwt(
            @Value("${jwt.secret}") String secreto,
            @Value("${jwt.expiration}") long duracionToken) {

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

    public Claims extraerClaims(String token) {

        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extraerCorreo(String token) {

        return extraerClaims(token)
                .getSubject();
    }

    public String extraerRol(String token) {

        return extraerClaims(token)
                .get("rol", String.class);
    }

    public Long extraerUsuarioId(String token) {

        Number usuarioId = extraerClaims(token)
                .get("usuarioId", Number.class);

        return usuarioId.longValue();
    }

    public boolean esTokenValido(String token) {

        try {
            Claims claims = extraerClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
