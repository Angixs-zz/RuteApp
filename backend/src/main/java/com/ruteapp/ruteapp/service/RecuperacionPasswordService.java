package com.ruteapp.ruteapp.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruteapp.ruteapp.dto.entrada.RestablecerPasswordEntrada;
import com.ruteapp.ruteapp.dto.entrada.SolicitudRecuperacionEntrada;
import com.ruteapp.ruteapp.dto.respuesta.MensajeRespuesta;
import com.ruteapp.ruteapp.exception.TokenRecuperacionInvalidoException;
import com.ruteapp.ruteapp.model.TokenRecuperacionPassword;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.repositories.TokenRecuperacionPasswordRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;

@Service
public class RecuperacionPasswordService {

    private static final int DURACION_MINUTOS = 30;
    private static final String MENSAJE_SOLICITUD =
            "Si el correo está registrado, recibirás un enlace de recuperación";

    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacionPasswordRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServicioCorreo servicioCorreo;
    private final SecureRandom secureRandom = new SecureRandom();

    public RecuperacionPasswordService(
            UsuarioRepository usuarioRepository,
            TokenRecuperacionPasswordRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            ServicioCorreo servicioCorreo) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.servicioCorreo = servicioCorreo;
    }

    @Transactional
    public MensajeRespuesta solicitar(SolicitudRecuperacionEntrada entrada) {
        usuarioRepository.findByCorreo(entrada.getCorreo())
                .filter(usuario -> Boolean.TRUE.equals(usuario.getActivo()))
                .ifPresent(this::crearYEnviarToken);

        return new MensajeRespuesta(MENSAJE_SOLICITUD);
    }

    @Transactional
    public MensajeRespuesta restablecer(RestablecerPasswordEntrada entrada) {
        TokenRecuperacionPassword token = tokenRepository
                .findByTokenHashAndUsadoFalse(hash(entrada.getToken()))
                .orElseThrow(() -> new TokenRecuperacionInvalidoException(
                        "El enlace de recuperación no es válido o ya fue utilizado"
                ));

        if (!token.getFechaExpiracion().isAfter(LocalDateTime.now())) {
            throw new TokenRecuperacionInvalidoException("El enlace de recuperación ha expirado");
        }

        Usuario usuario = token.getUsuario();
        usuario.setPassword(passwordEncoder.encode(entrada.getPassword()));
        token.setUsado(true);

        return new MensajeRespuesta("Contraseña actualizada correctamente");
    }

    private void crearYEnviarToken(Usuario usuario) {
        tokenRepository.findByUsuarioAndUsadoFalse(usuario)
                .forEach(token -> token.setUsado(true));

        String tokenPlano = generarToken();
        TokenRecuperacionPassword token = new TokenRecuperacionPassword();
        token.setUsuario(usuario);
        token.setTokenHash(hash(tokenPlano));
        token.setFechaExpiracion(LocalDateTime.now().plusMinutes(DURACION_MINUTOS));
        tokenRepository.save(token);

        servicioCorreo.enviarRecuperacion(usuario, tokenPlano);
    }

    private String generarToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String valor) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(valor.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(
                    "No fue posible procesar el token de recuperación",
                    ex
            );
        }
    }
}
