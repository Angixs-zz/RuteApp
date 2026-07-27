package com.ruteapp.ruteapp.exception;

public class CredencialesInvalidas extends RuntimeException {

    public CredencialesInvalidas(String mensaje) {
        super(mensaje);
    }
}