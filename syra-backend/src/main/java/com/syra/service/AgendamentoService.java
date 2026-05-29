package com.syra.service;

import com.syra.config.EntityNotFoundException;
import com.syra.dto.AgendamentoCriarDTO;
import com.syra.models.Agendamento;
import com.syra.models.HorarioAtendimento;
import com.syra.models.Servico;
import com.syra.models.Usuario;
import com.syra.repositories.AgendamentoRepository;
import com.syra.repositories.HorarioAtendimentoRepository;
import com.syra.repositories.ServicoRepository;
import com.syra.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final HorarioAtendimentoRepository horarioRepository;

    public Agendamento criarAgendamento(AgendamentoCriarDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario não encontrado com ID: " + dto.getUsuarioId()));

        Servico servico = servicoRepository.findById(dto.getServicoId())
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado com ID: " + dto.getServicoId()));

        LocalDateTime inicio = dto.getDataHoraInicio();
        LocalDateTime agora = LocalDateTime.now();

        if (inicio.isBefore(agora.plusHours(1))) {
            throw new IllegalArgumentException("Agendamentos devem ser feitos com no mínimo 1 hora de antecedência.");
        }

        HorarioAtendimento horarioDia = horarioRepository.findByDiaDaSemana(inicio.getDayOfWeek())
                .orElseThrow(() -> new EntityNotFoundException("Horário de atendimento não configurado para este dia."));

        if (!horarioDia.isTrabalhaNesseDia()) {
            throw new IllegalArgumentException("Não há atendimento neste dia da semana.");
        }

        LocalDateTime fim = inicio.plusMinutes(servico.getDuracaoMinutos());
        LocalTime horaInicio = inicio.toLocalTime();
        LocalTime horaFim = fim.toLocalTime();

        if (horaInicio.isBefore(horarioDia.getHoraAbertura()) || horaFim.isAfter(horarioDia.getHoraFechamento())) {
            throw new IllegalArgumentException("O horário foge do expediente de atendimento.");
        }

        if (horarioDia.getHoraInicioAlmoco() != null && horarioDia.getHoraFimAlmoco() != null) {
            boolean conflitoAlmoco = (horaInicio.isBefore(horarioDia.getHoraFimAlmoco()) && horaFim.isAfter(horarioDia.getHoraInicioAlmoco()));
            if (conflitoAlmoco) {
                throw new IllegalArgumentException("O horário conflita com o intervalo de almoço.");
            }
        }

        if (agendamentoRepository.existeConflitoDeHorario(inicio, fim)) {
            throw new IllegalArgumentException("Este horário já está reservado.");
        }

        Agendamento agendamento = Agendamento.builder()
                .usuario(usuario)
                .servico(servico)
                .dataHoraInicio(inicio)
                .dataHoraFim(fim)
                .status("CONFIRMADO")
                .build();

        return agendamentoRepository.save(agendamento);
    }

    public Agendamento obterPorId(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Agendamento não encontrado com ID: " + id));
    }

    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();
    }

    public List<Agendamento> buscarAgendamentosPorCliente(Long usuarioId) {
        return agendamentoRepository.findByUsuarioId(usuarioId);
    }

    public List<Agendamento> buscarPorStatus(String status) {
        return agendamentoRepository.findByStatus(status);
    }

    public List<Agendamento> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return agendamentoRepository.findByPeriodo(inicio, fim);
    }

    public Agendamento cancelarAgendamento(Long id, String observacoes) {
        Agendamento agendamento = obterPorId(id);

        if ("CANCELADO".equals(agendamento.getStatus())) {
            throw new IllegalArgumentException("Agendamento já foi cancelado.");
        }

        agendamento.setStatus("CANCELADO");
        agendamento.setObservacoes(observacoes != null ? observacoes : "Cancelado pelo cliente");

        return agendamentoRepository.save(agendamento);
    }

    public Agendamento confirmarAgendamento(Long id) {
        Agendamento agendamento = obterPorId(id);
        agendamento.setStatus("CONFIRMADO");
        return agendamentoRepository.save(agendamento);
    }

    public Agendamento reagendarAgendamento(Long id, LocalDateTime novaData) {
        Agendamento agendamento = obterPorId(id);

        if ("CANCELADO".equals(agendamento.getStatus())) {
            throw new IllegalArgumentException("Não é possível reagendar um agendamento cancelado.");
        }

        LocalDateTime agora = LocalDateTime.now();
        if (novaData.isBefore(agora.plusHours(1))) {
            throw new IllegalArgumentException("Nova data deve ser com no mínimo 1 hora de antecedência.");
        }

        LocalDateTime novaFim = novaData.plusMinutes(agendamento.getServico().getDuracaoMinutos());

        if (agendamentoRepository.existeConflitoDeHorario(novaData, novaFim)) {
            throw new IllegalArgumentException("Este horário já está reservado.");
        }

        agendamento.setDataHoraInicio(novaData);
        agendamento.setDataHoraFim(novaFim);

        return agendamentoRepository.save(agendamento);
    }

    public void deletarAgendamento(Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new EntityNotFoundException("Agendamento não encontrado com ID: " + id);
        }
        agendamentoRepository.deleteById(id);
    }
}