package com.ruteapp.ruteapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "participantes_viaje",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "viaje_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParticipanteViaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viaje_id", nullable = false)
    private Viaje viaje;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_invitacion", nullable = false, length = 30)
    private EstadoInvitacion estadoInvitacion;

    @Column(name = "permiso_colaborar", nullable = false)
    private Boolean permisoColaborar = false;

    @Column(name = "fecha_incorporacion", nullable = false)
    private LocalDateTime fechaIncorporacion;

    @PrePersist
    public void antesDeGuardar() {
        if (estadoInvitacion == null) {
            estadoInvitacion = EstadoInvitacion.PENDIENTE;
        }

        if (permisoColaborar == null) {
            permisoColaborar = false;
        }

        if (fechaIncorporacion == null) {
            fechaIncorporacion = LocalDateTime.now();
        }
    }
}
