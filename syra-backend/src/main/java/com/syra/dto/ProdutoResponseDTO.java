package com.syra.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Integer estoque;
    private String imagemUrl;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
}