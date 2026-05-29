package com.syra.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TelefoneDTO(
    @NotBlank(message = "Telefone não pode estar vazio")
    @Pattern(
        regexp = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$",
        message = "Telefone deve estar em um formato válido (ex: (11) 98765-4321)"
    )
    String numero
) {}
