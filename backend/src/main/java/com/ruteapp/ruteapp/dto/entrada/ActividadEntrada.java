package com.ruteapp.ruteapp.dto.entrada;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ActividadEntrada {

    @NotNull(message = "El ID del viaje es obligatorio")
    private Long viajeId;

    @NotBlank(message = "El lugar de la actividad no puede estar vacío")
    @Size(max = 150, message = "El lugar no puede superar los 150 caracteres")
    private String lugar;

    @NotNull(message = "El horario de la actividad es obligatorio")
    private LocalDateTime horario;

    private String descripcion;

    @NotNull(message = "El ID del responsable es obligatorio")
    private Long responsableId; // Cambiado de String a Long para el ID del usuario

    @DecimalMin(value = "0.0", inclusive = true, message = "El costo estimado no puede ser negativo")
    private BigDecimal costoEstimado;

    private String estado; // Opcional, por defecto se asigna PENDIENTE

    @Valid
    private LugarEntrada lugarReferencia;

    // Getters y Setters
    public Long getViajeId() { return viajeId; }
    public void setViajeId(Long viajeId) { this.viajeId = viajeId; }

    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }

    public LocalDateTime getHorario() { return horario; }
    public void setHorario(LocalDateTime horario) { this.horario = horario; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Long getResponsableId() { return responsableId; }
    public void setResponsableId(Long responsableId) { this.responsableId = responsableId; }

    public BigDecimal getCostoEstimado() { return costoEstimado; }
    public void setCostoEstimado(BigDecimal costoEstimado) { this.costoEstimado = costoEstimado; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LugarEntrada getLugarReferencia() { return lugarReferencia; }
    public void setLugarReferencia(LugarEntrada lugarReferencia) { this.lugarReferencia = lugarReferencia; }
}