package com.syra.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioCriarDTO {

    @NotBlank(message = "Nome não pode estar vazio")
    private String nome;

    @NotBlank(message = "Email não pode estar vazio")
    @Email(message = "Email deve ser válido")
    private String email;

    @Pattern(
        regexp = "^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$",
        message = "Telefone deve estar em um formato válido (ex: (11) 98765-4321)"
    )
    private String telefone;
}

