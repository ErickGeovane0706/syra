package com.syra.repositories;

import com.syra.models.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findByUsuarioId(Long usuarioId);

    List<Agendamento> findByStatus(String status);

    List<Agendamento> findByServicoId(Long servicoId);

    @Query("SELECT a FROM Agendamento a WHERE a.usuario.id = :usuarioId AND a.status = :status")
    List<Agendamento> findByUsuarioIdAndStatus(@Param("usuarioId") Long usuarioId, @Param("status") String status);

    // Retorna agendamentos em um período específico
    @Query("SELECT a FROM Agendamento a WHERE a.dataHoraInicio >= :inicio AND a.dataHoraFim <= :fim")
    List<Agendamento> findByPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    // Retorna true se encontrar algum agendamento confirmado que sobreponha o horário desejado
        @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Agendamento a " +
            "WHERE a.status IN ('CONFIRMADO', 'PENDENTE') " +
            "AND (a.dataHoraInicio < :fim AND a.dataHoraFim > :inicio)")
    boolean existeConflitoDeHorario(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

        @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Agendamento a " +
            "WHERE a.status IN ('CONFIRMADO', 'PENDENTE') " +
            "AND a.id <> :id " +
            "AND (a.dataHoraInicio < :fim AND a.dataHoraFim > :inicio)")
        boolean existeConflitoDeHorarioExcetoId(
            @Param("id") Long id,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
        );
}
