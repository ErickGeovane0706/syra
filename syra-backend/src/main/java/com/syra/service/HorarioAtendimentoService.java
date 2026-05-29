package com.syra.service;

import com.syra.config.EntityNotFoundException;
import com.syra.models.HorarioAtendimento;
import com.syra.repositories.HorarioAtendimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HorarioAtendimentoService {

    private final HorarioAtendimentoRepository horarioRepository;

    public List<HorarioAtendimento> listarHorarios() {
        return horarioRepository.findAll();
    }

    public HorarioAtendimento configurarHorario(HorarioAtendimento horario) {
        return horarioRepository.findByDiaDaSemana(horario.getDiaDaSemana())
                .map(existente -> {
                    existente.setHoraAbertura(horario.getHoraAbertura());
                    existente.setHoraFechamento(horario.getHoraFechamento());
                    existente.setHoraInicioAlmoco(horario.getHoraInicioAlmoco());
                    existente.setHoraFimAlmoco(horario.getHoraFimAlmoco());
                    existente.setTrabalhaNesseDia(horario.isTrabalhaNesseDia());
                    return horarioRepository.save(existente);
                })
                .orElseGet(() -> horarioRepository.save(horario));
    }

    public HorarioAtendimento buscarPorDia(DayOfWeek dia) {
        return horarioRepository.findByDiaDaSemana(dia)
                .orElseThrow(() -> new EntityNotFoundException("Horário de atendimento não configurado para: " + dia));
    }

    public HorarioAtendimento obterPorId(Long id) {
        return horarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Horário de atendimento não encontrado com ID: " + id));
    }

    public void deletarHorario(Long id) {
        if (!horarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Horário de atendimento não encontrado com ID: " + id);
        }
        horarioRepository.deleteById(id);
    }
}