package com.syra.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 1000)
    private String descricao;

    @Column(nullable = false)
    private BigDecimal preco;

    @Column(nullable = false)
    private Integer estoque;

    private String imagemUrl;
    private String publicId;        // útil se usar Cloudinary depois

    @Column(nullable = false)
    private Boolean ativo = true;

    private LocalDateTime dataCriacao = LocalDateTime.now();
    private LocalDateTime dataAtualizacao = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}