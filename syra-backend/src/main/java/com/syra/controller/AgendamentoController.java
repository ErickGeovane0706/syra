package com.syra.controller;

import com.syra.dto.AgendamentoCriarDTO;
import com.syra.dto.AgendamentoAtualizarStatusDTO;
import com.syra.models.Agendamento;
import com.syra.service.AgendamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
@Tag(name = "Agendamentos", description = "Endpoints para gerenciamento de agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @PostMapping
    @Operation(summary = "Criar novo agendamento")
    public ResponseEntity<Agendamento> criarAgendamento(@Valid @RequestBody AgendamentoCriarDTO dto) {
        Agendamento agendamento = agendamentoService.criarAgendamento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamento);
    }

    @GetMapping
    @Operation(summary = "Listar todos os agendamentos")
    public ResponseEntity<List<Agendamento>> listarTodos() {
        return ResponseEntity.ok(agendamentoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter agendamento por ID")
    public ResponseEntity<Agendamento> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.obterPorId(id));
    }

    @GetMapping("/cliente/{usuarioId}")
    @Operation(summary = "Listar agendamentos do cliente")
    public ResponseEntity<List<Agendamento>> listarPorCliente(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(agendamentoService.buscarAgendamentosPorCliente(usuarioId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Listar agendamentos por status")
    public ResponseEntity<List<Agendamento>> listarPorStatus(@PathVariable String status) {
        return ResponseEntity.ok(agendamentoService.buscarPorStatus(status));
    }

    @GetMapping("/periodo")
    @Operation(summary = "Listar agendamentos em um período")
    public ResponseEntity<List<Agendamento>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(agendamentoService.buscarPorPeriodo(inicio, fim));
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar agendamento")
    public ResponseEntity<Agendamento> cancelarAgendamento(
            @PathVariable Long id,
            @RequestBody(required = false) AgendamentoAtualizarStatusDTO dto) {
        String observacoes = dto != null ? dto.getObservacoes() : null;
        return ResponseEntity.ok(agendamentoService.cancelarAgendamento(id, observacoes));
    }

    @PatchMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar agendamento (admin only)")
    public ResponseEntity<Agendamento> confirmarAgendamento(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.confirmarAgendamento(id));
    }

    @PutMapping("/{id}/reagendar")
    @Operation(summary = "Reagendar agendamento")
    public ResponseEntity<Agendamento> reagendarAgendamento(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime novaData) {
        return ResponseEntity.ok(agendamentoService.reagendarAgendamento(id, novaData));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar agendamento (admin only)")
    public ResponseEntity<Void> deletarAgendamento(@PathVariable Long id) {
        agendamentoService.deletarAgendamento(id);
        return ResponseEntity.noContent().build();
    }
}