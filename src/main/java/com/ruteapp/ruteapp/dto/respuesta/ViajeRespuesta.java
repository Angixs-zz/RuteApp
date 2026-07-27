package com.ruteapp.ruteapp.dto.respuesta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.ruteapp.ruteapp.model.EstadoViaje;

public class ViajeRespuesta {

    private Long id;
    private String nombre;
    private String descripcion;
    private String origen;
    private String destino;
    private LugarRespuesta origenLugar;
    private LugarRespuesta destinoLugar;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private BigDecimal presupuestoEstimado;
    private String transporte;
    private EstadoViaje estado;
    private Boolean publico;
    private Long organizadorId;
    private String organizadorNombre;
    private LocalDateTime fechaCreacion;

    public ViajeRespuesta() {
    }

    public ViajeRespuesta(
            Long id,
            String nombre,
            String descripcion,
            String origen,
            String destino,
            LugarRespuesta origenLugar,
            LugarRespuesta destinoLugar,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            BigDecimal presupuestoEstimado,
            String transporte,
            EstadoViaje estado,
            Boolean publico,
            Long organizadorId,
            String organizadorNombre,
            LocalDateTime fechaCreacion) {

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.origen = origen;
        this.destino = destino;
        this.origenLugar = origenLugar;
        this.destinoLugar = destinoLugar;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.presupuestoEstimado = presupuestoEstimado;
        this.transporte = transporte;
        this.estado = estado;
        this.publico = publico;
        this.organizadorId = organizadorId;
        this.organizadorNombre = organizadorNombre;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public String getOrigen() {
        return origen;
    }

    public String getDestino() {
        return destino;
    }

    public LugarRespuesta getOrigenLugar() {
        return origenLugar;
    }

    public LugarRespuesta getDestinoLugar() {
        return destinoLugar;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public BigDecimal getPresupuestoEstimado() {
        return presupuestoEstimado;
    }

    public String getTransporte() {
        return transporte;
    }

    public EstadoViaje getEstado() {
        return estado;
    }

    public Boolean getPublico() {
        return publico;
    }

    public Long getOrganizadorId() {
        return organizadorId;
    }

    public String getOrganizadorNombre() {
        return organizadorNombre;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}