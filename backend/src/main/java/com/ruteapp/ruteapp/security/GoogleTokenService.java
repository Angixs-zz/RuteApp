package com.ruteapp.ruteapp.security;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.ruteapp.ruteapp.exception.CredencialesInvalidas;

@Service
public class GoogleTokenService {

    private final String clientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenService(
            @Value("${google.client-id:}") String clientId) {
        this.clientId = clientId;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        ).setAudience(List.of(clientId)).build();
    }

    public GoogleIdentity verificar(String credential) {
        if (clientId.isBlank()) {
            throw new IllegalStateException(
                    "El inicio de sesión con Google no está configurado"
            );
        }

        try {
            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                throw credencialInvalida();
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())
                    || payload.getSubject() == null
                    || payload.getEmail() == null) {
                throw credencialInvalida();
            }

            return new GoogleIdentity(
                    payload.getSubject(),
                    payload.getEmail(),
                    claim(payload, "name"),
                    claim(payload, "picture")
            );
        } catch (GeneralSecurityException | IOException ex) {
            throw credencialInvalida();
        }
    }

    private String claim(GoogleIdToken.Payload payload, String nombre) {
        Object valor = payload.get(nombre);
        return valor instanceof String texto ? texto : null;
    }

    private CredencialesInvalidas credencialInvalida() {
        return new CredencialesInvalidas("La credencial de Google no es válida");
    }

    public record GoogleIdentity(
            String subject,
            String correo,
            String nombre,
            String avatar) {
    }
}
