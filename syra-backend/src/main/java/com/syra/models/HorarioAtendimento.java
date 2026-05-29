package com.syra.models;


import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "horarios_atendimento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorarioAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private DayOfWeek diaDaSemana;

    private LocalTime horaAbertura;

    private LocalTime horaFechamento;

    private LocalTime horaInicioAlmoco;

    private LocalTime horaFimAlmoco;

    @Column(nullable = false)
    private boolean trabalhaNesseDia;
}