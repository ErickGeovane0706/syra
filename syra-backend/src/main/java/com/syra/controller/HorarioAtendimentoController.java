package com.syra.controller;

import com.syra.models.HorarioAtendimento;
import com.syra.service.HorarioAtendimentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@Tag(name = "Horários de Atendimento", description = "Endpoints para gerenciamento de horários de atendimento")
public class HorarioAtendimentoController {

    private final HorarioAtendimentoService horarioService;

    @GetMapping
    @Operation(summary = "Listar todos os horários de atendimento")
    public ResponseEntity<List<HorarioAtendimento>> listarTodos() {
        return ResponseEntity.ok(horarioService.listarHorarios());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter horário por ID")
    public ResponseEntity<HorarioAtendimento> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(horarioService.obterPorId(id));
    }

    @GetMapping("/dia/{dia}")
    @Operation(summary = "Obter horário de um dia específico")
    public ResponseEntity<HorarioAtendimento> obterPorDia(@PathVariable DayOfWeek dia) {
        return ResponseEntity.ok(horarioService.buscarPorDia(dia));
    }

    @PostMapping
    @Operation(summary = "Configurar horário de atendimento (admin only)")
    public ResponseEntity<HorarioAtendimento> configurarHorario(@Valid @RequestBody HorarioAtendimento horario) {
        HorarioAtendimento configurado = horarioService.configurarHorario(horario);
        return ResponseEntity.status(HttpStatus.CREATED).body(configurado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar horário de atendimento (admin only)")
    public ResponseEntity<HorarioAtendimento> atualizarHorario(@PathVariable Long id, @Valid @RequestBody HorarioAtendimento horario) {
        horario.setId(id);
        HorarioAtendimento atualizado = horarioService.configurarHorario(horario);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar horário de atendimento (admin only)")
    public ResponseEntity<Void> deletarHorario(@PathVariable Long id) {
        horarioService.deletarHorario(id);
        return ResponseEntity.noContent().build();
    }
}