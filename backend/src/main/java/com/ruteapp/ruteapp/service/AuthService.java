package com.ruteapp.ruteapp.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ruteapp.ruteapp.dto.entrada.LoginEntrada;
import com.ruteapp.ruteapp.dto.respuesta.LoginRespuesta;
import com.ruteapp.ruteapp.exception.CredencialesInvalidas;
import com.ruteapp.ruteapp.model.Rol;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.repositories.RolRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;
import com.ruteapp.ruteapp.security.GoogleTokenService;
import com.ruteapp.ruteapp.security.GoogleTokenService.GoogleIdentity;
import com.ruteapp.ruteapp.security.ServicioGestionTokensJwt;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServicioGestionTokensJwt jwtService;
    private final GoogleTokenService googleTokenService;
    private final ServicioCorreo servicioCorreo;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder,
            ServicioGestionTokensJwt jwtService,
            GoogleTokenService googleTokenService,
            ServicioCorreo servicioCorreo) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleTokenService = googleTokenService;
        this.servicioCorreo = servicioCorreo;
    }

    public LoginRespuesta login(LoginEntrada entrada) {
        //token
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

        boolean passwordCorrecta = usuario.getPassword() != null
                && passwordEncoder.matches(
                        entrada.getPassword(),
                        usuario.getPassword()
                );

        if (!passwordCorrecta) {
            throw new CredencialesInvalidas(
                    "Correo o contraseña incorrectos"
            );
        }

        return crearRespuesta(usuario);
    }

    @Transactional
    public LoginRespuesta loginGoogle(String credential) {
        GoogleIdentity identity = googleTokenService.verificar(credential);
        Usuario usuario = usuarioRepository
                .findByGoogleSubject(identity.subject())
                .orElseGet(() -> vincularOCrearUsuario(identity));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new CredencialesInvalidas("La cuenta está desactivada");
        }

        return crearRespuesta(usuario);
    }

    private Usuario vincularOCrearUsuario(GoogleIdentity identity) {
        Usuario existente = usuarioRepository
                .findByCorreoIgnoreCase(identity.correo())
                .orElse(null);

        if (existente != null) {
            if (existente.getGoogleSubject() != null
                    && !existente.getGoogleSubject().equals(identity.subject())) {
                throw new CredencialesInvalidas(
                        "El correo ya está vinculado a otra cuenta de Google"
                );
            }

            existente.setGoogleSubject(identity.subject());
            return usuarioRepository.save(existente);
        }

        Rol rolUsuario = rolRepository.findByNombre("USUARIO")
                .orElseThrow(() -> new IllegalStateException(
                        "El rol USUARIO no está configurado"
                ));

        Usuario nuevo = new Usuario();
        nuevo.setNombre(nombreGoogle(identity));
        nuevo.setCorreo(identity.correo().trim().toLowerCase(Locale.ROOT));
        nuevo.setGoogleSubject(identity.subject());
        nuevo.setActivo(true);
        nuevo.setRol(rolUsuario);
        Usuario guardado = usuarioRepository.save(nuevo);
        servicioCorreo.enviarBienvenida(guardado);
        return guardado;
    }

    private String nombreGoogle(GoogleIdentity identity) {
        if (identity.nombre() != null && !identity.nombre().isBlank()) {
            return identity.nombre().trim();
        }

        return identity.correo().substring(0, identity.correo().indexOf('@'));
    }

    //despues pasa aqui 

    private LoginRespuesta crearRespuesta(Usuario usuario) {
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
