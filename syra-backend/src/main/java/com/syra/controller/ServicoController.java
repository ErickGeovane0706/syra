package com.syra.controller;

import com.syra.dto.ServicoDTO;
import com.syra.models.Servico;
import com.syra.service.ServicoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
@RequiredArgsConstructor
@Tag(name = "Serviços", description = "Endpoints para gerenciamento de serviços")
public class ServicoController {
    private final ServicoService servicoService;

    @GetMapping
    @Operation(summary = "Listar todos os serviços")
    public ResponseEntity<List<Servico>> listarTodos() {
        return ResponseEntity.ok(servicoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter serviço por ID")
    public ResponseEntity<Servico> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicoService.buscarPorId(id));
    }

    @GetMapping("/buscar/{nome}")
    @Operation(summary = "Buscar serviços por nome")
    public ResponseEntity<List<Servico>> buscarPorNome(@PathVariable String nome) {
        return ResponseEntity.ok(servicoService.buscarPorNome(nome));
    }

    @PostMapping
    @Operation(summary = "Criar novo serviço (admin only)")
    public ResponseEntity<Servico> criarServico(@Valid @RequestBody ServicoDTO dto) {
        Servico servico = servicoService.criarServico(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(servico);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar serviço (admin only)")
    public ResponseEntity<Servico> atualizarServico(@PathVariable Long id, @Valid @RequestBody ServicoDTO dto) {
        return ResponseEntity.ok(servicoService.atualizarServico(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar serviço (admin only)")
    public ResponseEntity<Void> deletarServico(@PathVariable Long id) {
        servicoService.deletarServico(id);
        return ResponseEntity.noContent().build();
    }
}
