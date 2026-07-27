package com.ruteapp.ruteapp.dto.respuesta;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.ruteapp.ruteapp.model.CategoriaGasto;

public class GastoRespuesta {

    private Long id;
    private Long viajeId;
    private String viajeNombre;
    private Long pagadorId;
    private String pagadorNombre;
    private String concepto;
    private BigDecimal monto;
    private CategoriaGasto categoria;
    private LocalDate fecha;

    public GastoRespuesta() {
    }

    public GastoRespuesta(
            Long id,
            Long viajeId,
            String viajeNombre,
            Long pagadorId,
            String pagadorNombre,
            String concepto,
            BigDecimal monto,
            CategoriaGasto categoria,
            LocalDate fecha) {

        this.id = id;
        this.viajeId = viajeId;
        this.viajeNombre = viajeNombre;
        this.pagadorId = pagadorId;
        this.pagadorNombre = pagadorNombre;
        this.concepto = concepto;
        this.monto = monto;
        this.categoria = categoria;
        this.fecha = fecha;
    }

    public Long getId() {
        return id;
    }

    public Long getViajeId() {
        return viajeId;
    }

    public String getViajeNombre() {
        return viajeNombre;
    }

    public Long getPagadorId() {
        return pagadorId;
    }

    public String getPagadorNombre() {
        return pagadorNombre;
    }

    public String getConcepto() {
        return concepto;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public CategoriaGasto getCategoria() {
        return categoria;
    }

    public LocalDate getFecha() {
        return fecha;
    }
}