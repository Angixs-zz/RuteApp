package com.ruteapp.ruteapp.util;

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
}
