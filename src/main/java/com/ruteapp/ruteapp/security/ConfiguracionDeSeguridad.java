package com.ruteapp.ruteapp.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method
        .configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders
        .HttpSecurity;
import org.springframework.security.config.http
        .SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication
        .UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class ConfiguracionDeSeguridad {

    private final FiltroDeAutenticacionJwt jwtAuthenticationFilter;

    public ConfiguracionDeSeguridad(
            FiltroDeAutenticacionJwt jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                /*
                 * No usamos sesiones.
                 * Cada petición debe traer su JWT.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(excepciones -> excepciones

                        .authenticationEntryPoint(
                                (request, response, exception) -> {

                                    response.setStatus(
                                            HttpServletResponse.SC_UNAUTHORIZED
                                    );

                                    response.setContentType(
                                            "application/json"
                                    );

                                    response.setCharacterEncoding("UTF-8");

                                    response.getWriter().write("""
                                        {
                                          "status": 401,
                                          "error": "Unauthorized",
                                          "mensaje": "Debes iniciar sesión para acceder a este recurso"
                                        }
                                        """);
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, exception) -> {

                                    response.setStatus(
                                            HttpServletResponse.SC_FORBIDDEN
                                    );

                                    response.setContentType(
                                            "application/json"
                                    );

                                    response.setCharacterEncoding("UTF-8");

                                    response.getWriter().write("""
                                        {
                                          "status": 403,
                                          "error": "Forbidden",
                                          "mensaje": "No tienes permiso para acceder a este recurso"
                                        }
                                        """);
                                }
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Rutas públicas.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login",
                                "/api/usuarios"
                        ).permitAll()

                        /*
                         * Solo administrador administra roles.
                         */
                        .requestMatchers(
                                "/api/roles/**"
                        ).hasRole("ADMINISTRADOR")

                        /*
                         * Solo administrador puede consultar
                         * todos los usuarios.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/usuarios"
                        ).hasRole("ADMINISTRADOR")

                        /*
                         * Usuario y agencia pueden crear viajes.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/viajes"
                        ).hasAnyRole(
                                "USUARIO",
                                "AGENCIA"
                        )

                        /*
                         * Cualquier otra petición requiere
                         * un token válido.
                         */
                        .anyRequest().authenticated()
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}