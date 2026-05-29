package com.syra.service;

import com.syra.config.EntityNotFoundException;
import com.syra.dto.ServicoDTO;
import com.syra.models.Agendamento;
import com.syra.models.Servico;
import com.syra.repositories.AgendamentoRepository;
import com.syra.repositories.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final AgendamentoRepository agendamentoRepository;

    public Servico criarServico(ServicoDTO dto) {
        Servico servico = Servico.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .preco(dto.getPreco())
                .duracaoMinutos(dto.getDuracaoMinutos())
                .build();
        return servicoRepository.save(servico);
    }

    public List<Servico> listarTodos() {
        return servicoRepository.findAll();
    }

    public Servico buscarPorId(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serviço não encontrado com ID: " + id));
    }

    public Servico atualizarServico(Long id, ServicoDTO dto) {
        Servico servico = buscarPorId(id);
        servico.setNome(dto.getNome());
        servico.setDescricao(dto.getDescricao());
        servico.setPreco(dto.getPreco());
        servico.setDuracaoMinutos(dto.getDuracaoMinutos());
        return servicoRepository.save(servico);
    }

    public void deletarServico(Long id) {
        Servico servico = buscarPorId(id);

        // Verificar se há agendamentos vinculados
        List<Agendamento> agendamentos = agendamentoRepository.findByServicoId(id);
        if (!agendamentos.isEmpty()) {
            throw new IllegalArgumentException("Não é possível deletar o serviço pois existem agendamentos vinculados.");
        }

        servicoRepository.deleteById(id);
    }

    public List<Servico> buscarPorNome(String nome) {
        return servicoRepository.findByNomeContainingIgnoreCase(nome);
    }

    public Servico salvar(Servico servico) {
        return servicoRepository.save(servico);
    }
}
