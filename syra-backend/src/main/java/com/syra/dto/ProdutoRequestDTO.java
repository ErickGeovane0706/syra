package com.syra.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoRequestDTO {

    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Integer estoque;

    // Se quiser adicionar validações no futuro:
    // @NotBlank(message = "Título é obrigatório")
    // @Size(max = 150)
}