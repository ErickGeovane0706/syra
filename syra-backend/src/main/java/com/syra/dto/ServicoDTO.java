package com.syra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicoDTO {

    private Long id;

    @NotBlank(message = "Nome do serviço não pode estar vazio")
    private String nome;

    private String descricao;

    @NotNull(message = "Preço não pode ser nulo")
    @Positive(message = "Preço deve ser maior que zero")
    private BigDecimal preco;

    @NotNull(message = "Duração em minutos não pode ser nula")
    @Positive(message = "Duração deve ser maior que zero")
    private Integer duracaoMinutos;
}

