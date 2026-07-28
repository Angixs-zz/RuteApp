package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class GoogleLoginEntrada {

    @NotBlank(message = "La credencial de Google es obligatoria")
    @Size(max = 5000, message = "La credencial de Google no es válida")
    private String credential;

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }
}
