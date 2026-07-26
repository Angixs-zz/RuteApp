package com.ruteapp.ruteapp.dto.respuesta;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ActividadRespuesta {

    private Long id;
    private Long viajeId;
    private String nombreViaje;
    private String lugar;
    private LocalDateTime horario;
    private String descripcion;
    private Long responsableId;       // Añadido para el ID
    private String nombreResponsable; // Añadido para mostrar el nombre limpio
    private BigDecimal costoEstimado;
    private String estado;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getViajeId() { return viajeId; }
    public void setViajeId(Long viajeId) { this.viajeId = viajeId; }

    public String getNombreViaje() { return nombreViaje; }
    public void setNombreViaje(String nombreViaje) { this.nombreViaje = nombreViaje; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public LocalDateTime getHorario() { return horario; }
    public void setHorario(LocalDateTime horario) { this.horario = horario; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Long getResponsableId() { return responsableId; }
    public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }

    public String getNombreResponsable() { return nombreResponsable; }
    public void setNombreResponsable(String nombreResponsable) { this.nombreResponsable = nombreResponsable; }

    public BigDecimal getCostoEstimado() { return costoEstimado; }
    public void setCostoEstimado(BigDecimal costoEstimado) { this.costoEstimado = costoEstimado; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}