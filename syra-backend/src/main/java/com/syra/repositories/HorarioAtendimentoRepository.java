package com.syra.repositories;



import com.syra.models.HorarioAtendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.DayOfWeek;
import java.util.Optional;

@Repository
public interface HorarioAtendimentoRepository extends JpaRepository<HorarioAtendimento, Long> {
    Optional<HorarioAtendimento> findByDiaDaSemana(DayOfWeek diaDaSemana);
}
