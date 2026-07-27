package com.ruteapp.ruteapp.dto.respuesta;

import java.util.List;

public class PaginaRespuesta<T> {

    private List<T> contenido;
    private int paginaActual;
    private int tamanioPagina;
    private long totalElementos;
    private int totalPaginas;
    private boolean ultima;

    public PaginaRespuesta(
            List<T> contenido,
            int paginaActual,
            int tamanioPagina,
            long totalElementos,
            int totalPaginas,
            boolean ultima) {

        this.contenido = contenido;
        this.paginaActual = paginaActual;
        this.tamanioPagina = tamanioPagina;
        this.totalElementos = totalElementos;
        this.totalPaginas = totalPaginas;
        this.ultima = ultima;
    }

    public List<T> getContenido() {
        return contenido;
    }

    public int getPaginaActual() {
        return paginaActual;
    }

    public int getTamanioPagina() {
        return tamanioPagina;
    }

    public long getTotalElementos() {
        return totalElementos;
    }

    public int getTotalPaginas() {
        return totalPaginas;
    }

    public boolean isUltima() {
        return ultima;
    }
}
