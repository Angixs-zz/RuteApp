package com.ruteapp.ruteapp.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                // desactiva csrf para poder probar post, put y delete
                .csrf(csrf -> csrf.disable())

                // deja pasar todas las peticiones por ahora
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )

                // quita la pantalla de inicio de sesion
                .formLogin(form -> form.disable())

                // quita la autenticacion basica del navegador
                .httpBasic(basic -> basic.disable());

        // guarda y devuelve la configuracion
        return http.build();
    }
}