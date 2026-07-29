package com.ruteapp.ruteapp.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ruteapp.ruteapp.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    List<Usuario> findByTelefonoIn(Collection<String> telefonos);

    Optional<Usuario> findByGoogleSubject(String googleSubject);

    boolean existsByCorreo(String correo);

    @Query("""
            SELECT u FROM Usuario u WHERE
            (:busqueda = '' OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(u.correo) LIKE LOWER(CONCAT('%', :busqueda, '%')))
            AND (:rol = '' OR u.rol.nombre = :rol)
            AND (:activo IS NULL OR u.activo = :activo)
            """)
    Page<Usuario> buscar(@Param("busqueda") String busqueda, @Param("rol") String rol, @Param("activo") Boolean activo, Pageable pageable);
}
