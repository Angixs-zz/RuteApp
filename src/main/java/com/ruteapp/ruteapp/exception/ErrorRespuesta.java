package com.ruteapp.ruteapp.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorRespuesta {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String mensaje;
    private String ruta;
    private Map<String, String> erroresValidacion;

    public ErrorRespuesta() {
    }

    public ErrorRespuesta(
            LocalDateTime timestamp,
            int status,
            String error,
            String mensaje,
            String ruta,
            Map<String, String> erroresValidacion) {

        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.mensaje = mensaje;
        this.ruta = ruta;
        this.erroresValidacion = erroresValidacion;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMensaje() {
        return mensaje;
    }

    public String getRuta() {
        return ruta;
    }

    public Map<String, String> getErroresValidacion() {
        return erroresValidacion;
    }
}
