package com.ruteapp.ruteapp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.ruteapp.ruteapp.dto.entrada.UsuarioEntrada;
import com.ruteapp.ruteapp.dto.entrada.UsuarioAdminEntrada;
import com.ruteapp.ruteapp.dto.entrada.ActualizarPerfilEntrada;
import com.ruteapp.ruteapp.dto.respuesta.UsuarioRespuesta;
import com.ruteapp.ruteapp.dto.respuesta.PaginaRespuesta;
import com.ruteapp.ruteapp.exception.CorreoDuplicadoException;
import com.ruteapp.ruteapp.exception.RecursoNoEncontradoException;
import com.ruteapp.ruteapp.model.Rol;
import com.ruteapp.ruteapp.model.Usuario;
import com.ruteapp.ruteapp.repositories.RolRepository;
import com.ruteapp.ruteapp.repositories.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final ServicioCorreo servicioCorreo;
    private final WhatsAppService whatsAppService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder,
            ServicioCorreo servicioCorreo,
            WhatsAppService whatsAppService) {

        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.servicioCorreo = servicioCorreo;
        this.whatsAppService = whatsAppService;
    }

    public List<UsuarioRespuesta> listarTodos() {

        List<Usuario> usuarios = usuarioRepository.findAll();
        List<UsuarioRespuesta> respuestas = new ArrayList<>();

        for (Usuario usuario : usuarios) {
            respuestas.add(convertirARespuesta(usuario));
        }

        return respuestas;
    }

    public PaginaRespuesta<UsuarioRespuesta> listarPaginados(int pagina, int tamanio, String busqueda, String rol, Boolean activo) {
        Page<UsuarioRespuesta> resultado = usuarioRepository.buscar(busqueda == null ? "" : busqueda.trim(), rol == null ? "" : rol, activo, PageRequest.of(pagina, tamanio, Sort.by("fechaCreacion").descending())).map(this::convertirARespuesta);
        return new PaginaRespuesta<>(resultado.getContent(), resultado.getNumber(), resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages(), resultado.isLast());
    }

    public UsuarioRespuesta buscarPorId(Long id) {

        Usuario usuario = obtenerEntidadPorId(id);

        return convertirARespuesta(usuario);
    }

    public UsuarioRespuesta buscarPorCorreo(String correo) {

        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario no encontrado"));

        return convertirARespuesta(usuario);
    }

    public UsuarioRespuesta crear(UsuarioEntrada entrada) {

        if (usuarioRepository.existsByCorreo(entrada.getCorreo())) {
            throw new CorreoDuplicadoException("El correo ya está registrado");
        }

        Rol rol = obtenerRolPorId(entrada.getRolId());

        Usuario usuario = new Usuario();

        copiarDatos(entrada, usuario, rol);

        usuario.setActivo(true);

        Usuario guardado = usuarioRepository.save(usuario);
        servicioCorreo.enviarBienvenida(guardado);
        whatsAppService.enviarNotificacion(
                guardado,
                "Hola " + guardado.getNombre()
                        + ", tu cuenta de RuteApp fue creada correctamente. "
                        + "Ya puedes organizar tus próximos viajes."
        );

        return convertirARespuesta(guardado);
    }

    public UsuarioRespuesta crearPublico(UsuarioEntrada entrada) {
        Rol rol = obtenerRolPorId(entrada.getRolId());
        if ("ADMINISTRADOR".equals(rol.getNombre())) throw new IllegalArgumentException("El rol administrador solo puede asignarlo otro administrador");
        return crear(entrada);
    }

    public UsuarioRespuesta actualizar(
            Long id,
            UsuarioEntrada entrada) {

        Usuario usuario = obtenerEntidadPorId(id);

        validarCorreoActualizacion(id, entrada.getCorreo());

        Rol rol = obtenerRolPorId(entrada.getRolId());

        copiarDatos(entrada, usuario, rol);

        Usuario actualizado = usuarioRepository.save(usuario);

        return convertirARespuesta(actualizado);
    }

    public UsuarioRespuesta actualizarComoAdmin(Long id, UsuarioAdminEntrada entrada) {
        Usuario usuario = obtenerEntidadPorId(id);
        validarCorreoActualizacion(id, entrada.getCorreo());
        usuario.setNombre(entrada.getNombre().trim());
        usuario.setCorreo(entrada.getCorreo().trim().toLowerCase(Locale.ROOT));
        usuario.setTelefono(normalizarTelefono(entrada.getTelefono()));
        usuario.setRol(obtenerRolPorId(entrada.getRolId()));
        usuario.setActivo(entrada.getActivo());
        if (entrada.getPassword() != null && !entrada.getPassword().isBlank()) usuario.setPassword(passwordEncoder.encode(entrada.getPassword()));
        return convertirARespuesta(usuarioRepository.save(usuario));
    }

    public UsuarioRespuesta actualizarPerfil(
            Long id,
            ActualizarPerfilEntrada entrada) {
        Usuario usuario = obtenerEntidadPorId(id);
        validarCorreoActualizacion(id, entrada.getCorreo());

        usuario.setNombre(entrada.getNombre().trim());
        usuario.setCorreo(entrada.getCorreo().trim().toLowerCase(Locale.ROOT));
        usuario.setTelefono(normalizarTelefono(entrada.getTelefono()));

        return convertirARespuesta(usuarioRepository.save(usuario));
    }

    public void eliminar(Long id) {

        Usuario usuario = obtenerEntidadPorId(id);

        usuarioRepository.delete(usuario);
    }

    public Usuario obtenerEntidadPorId(Long id) {

        return usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    private Rol obtenerRolPorId(Long rolId) {

        return rolRepository.findById(rolId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Rol no encontrado"));
    }

    private void copiarDatos(
            UsuarioEntrada entrada,
            Usuario usuario,
            Rol rol) {

        usuario.setNombre(entrada.getNombre());
        usuario.setCorreo(entrada.getCorreo());
        usuario.setPassword(passwordEncoder.encode(entrada.getPassword()));
        usuario.setTelefono(normalizarTelefono(entrada.getTelefono()));
        usuario.setRol(rol);
    }

    private String normalizarTelefono(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            return null;
        }
        return telefono.trim();
    }

    private void validarCorreoActualizacion(
            Long usuarioId,
            String correo) {

        Usuario usuarioConCorreo = usuarioRepository
                .findByCorreo(correo)
                .orElse(null);

        if (usuarioConCorreo != null
                && !usuarioConCorreo.getId().equals(usuarioId)) {

            throw new CorreoDuplicadoException(
                    "El correo ya está registrado"
            );
        }
    }

    private UsuarioRespuesta convertirARespuesta(Usuario usuario) {

        return new UsuarioRespuesta(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getActivo(),
                usuario.getRol().getNombre(),
                usuario.getFechaCreacion()
        );
    }
}
