package com.ruteapp.ruteapp.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ruteapp.ruteapp.dto.entrada.LoginEntrada;
import com.ruteapp.ruteapp.dto.respuesta.LoginRespuesta;
import com.ruteapp.ruteapp.exception.CredencialesInvalidas;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.security.ServicioGestionTokensJwt;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServicioGestionTokensJwt jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            ServicioGestionTokensJwt jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginRespuesta login(LoginEntrada entrada) {

        Usuario usuario = usuarioRepository
                .findByCorreo(entrada.getCorreo())
                .orElseThrow(() ->
                        new CredencialesInvalidas(
                                "Correo o contraseña incorrectos"
                        )
                );

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new CredencialesInvalidas(
                    "La cuenta está desactivada"
            );
        }

        boolean passwordCorrecta = passwordEncoder.matches(
                entrada.getPassword(),
                usuario.getPassword()
        );

        if (!passwordCorrecta) {
            throw new CredencialesInvalidas(
                    "Correo o contraseña incorrectos"
            );
        }

        String token = jwtService.generarToken(usuario);

        return new LoginRespuesta(
                token,
                "Bearer",
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol().getNombre()
        );
    }
}
