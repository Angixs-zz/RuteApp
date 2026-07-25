package com.ruteapp.ruteapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "actividades_itinerario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActividadItinerario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viaje_id", nullable = false)
    private Viaje viaje;

    @Column(nullable = false, length = 150)
    private String lugar;

    @Column(nullable = false)
    private LocalDateTime horario;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 100)
    private String responsable;

    @Column(name = "costo_estimado", precision = 12, scale = 2)
    private BigDecimal costoEstimado;

    @Column(nullable = false, length = 30)
    private String estado = "PENDIENTE";
}
