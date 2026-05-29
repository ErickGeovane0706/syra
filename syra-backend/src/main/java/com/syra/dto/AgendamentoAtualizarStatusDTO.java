package com.syra.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgendamentoAtualizarStatusDTO {

    @NotBlank(message = "Status não pode estar vazio")
    private String status; // CONFIRMADO, CANCELADO, etc

    private String observacoes;
}

