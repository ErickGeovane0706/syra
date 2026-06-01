package com.syra.service;

import com.syra.config.ConflictException;
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
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
    private final GoogleCalendarService googleCalendarService;

    @Transactional(isolation = Isolation.SERIALIZABLE)
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
            throw new ConflictException("Este horário já está reservado.");
        }

        Agendamento agendamento = Agendamento.builder()
                .usuario(usuario)
                .servico(servico)
                .dataHoraInicio(inicio)
                .dataHoraFim(fim)
                .status("PENDENTE")
                .build();

        Agendamento saved = agendamentoRepository.save(agendamento);
        String eventId = googleCalendarService.createOrUpdateEvent(saved);
        if (eventId != null) {
            saved.setGoogleEventId(eventId);
            saved = agendamentoRepository.save(saved);
        }

        return saved;
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

    @Transactional
    public Agendamento cancelarAgendamento(Long id, String observacoes) {
        Agendamento agendamento = obterPorId(id);

        if ("CANCELADO".equals(agendamento.getStatus())) {
            throw new IllegalArgumentException("Agendamento já foi cancelado.");
        }

        agendamento.setStatus("CANCELADO");
        agendamento.setObservacoes(observacoes != null ? observacoes : "Cancelado pelo cliente");
        googleCalendarService.cancelEventIfPresent(agendamento);
        agendamento.setGoogleEventId(null);

        return agendamentoRepository.save(agendamento);
    }

    @Transactional
    public Agendamento confirmarAgendamento(Long id) {
        Agendamento agendamento = obterPorId(id);

        if ("CANCELADO".equals(agendamento.getStatus())) {
            throw new ConflictException("Não é possível confirmar um agendamento cancelado.");
        }

        if ("CONFIRMADO".equals(agendamento.getStatus()) && StringUtils.hasText(agendamento.getGoogleEventId())) {
            return agendamento;
        }

        agendamento.setStatus("CONFIRMADO");
        Agendamento saved = agendamentoRepository.save(agendamento);
        String eventId = googleCalendarService.createOrUpdateEvent(saved);
        if (eventId != null) {
            saved.setGoogleEventId(eventId);
            saved = agendamentoRepository.save(saved);
        }

        return saved;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
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

        if (agendamentoRepository.existeConflitoDeHorarioExcetoId(id, novaData, novaFim)) {
            throw new ConflictException("Este horário já está reservado.");
        }

        agendamento.setDataHoraInicio(novaData);
        agendamento.setDataHoraFim(novaFim);

        Agendamento saved = agendamentoRepository.save(agendamento);
        String eventId = googleCalendarService.createOrUpdateEvent(saved);
        if (eventId != null) {
            saved.setGoogleEventId(eventId);
            saved = agendamentoRepository.save(saved);
        }

        return saved;
    }

    public void deletarAgendamento(Long id) {
        Agendamento agendamento = obterPorId(id);
        googleCalendarService.cancelEventIfPresent(agendamento);
        agendamentoRepository.deleteById(agendamento.getId());
    }
}