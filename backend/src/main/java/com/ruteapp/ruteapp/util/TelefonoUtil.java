package com.ruteapp.ruteapp.util;

import java.util.List;

public final class TelefonoUtil {

    private TelefonoUtil() {
    }

    public static String normalizar(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            return null;
        }

        String limpio = telefono.trim().replaceAll("[\\s()-]", "");

        if (limpio.matches("^\\+521\\d{10}$")) {
            return limpio;
        }

        // Twilio's WhatsApp Sandbox expects Mexican mobile numbers as +521 followed by 10 digits.
        if (limpio.matches("^\\d{10}$")) {
            return "+521" + limpio;
        }
        if (limpio.matches("^\\+?52\\d{10}$")) {
            return "+521" + limpio.replaceFirst("^\\+?52", "");
        }

        return limpio;
    }

    public static List<String> variantesBusqueda(String telefono) {
        String normalizado = normalizar(telefono);
        if (normalizado == null) {
            return List.of();
        }
        if (normalizado.matches("^\\+521\\d{10}$")) {
            String numeroNacional = normalizado.substring(4);
            return List.of(normalizado, "+52" + numeroNacional, "52" + numeroNacional, numeroNacional);
        }
        return List.of(normalizado);
    }
}
