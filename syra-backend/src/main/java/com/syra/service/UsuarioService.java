package com.syra.service;

import com.syra.config.ConflictException;
import com.syra.config.EntityNotFoundException;
import com.syra.dto.UsuarioCriarDTO;
import com.syra.models.Usuario;
import com.syra.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    // Administradores com permissão total, separados por vírgula. Vem da variável de
    // ambiente ADMIN_EMAILS: e-mail é dado pessoal e não pode ser versionado no código.
    @Value("${app.admin.emails:}")
    private String emailsAdmin;

    public Usuario processarLoginGoogle(String email, String nome, String fotoUrl) {
        // Define a role com base na lista de e-mails
        String roleAtribuida = isAdmin(email) ? "ADMIN" : "CLIENTE";

        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    // Atualiza a role caso ela tenha mudado na lista do código
                    usuario.setRole(roleAtribuida);
                    return usuarioRepository.save(usuario);
                })
                .orElseGet(() -> {
                    // Se for o primeiro login, cria o usuário com a role correta
                    Usuario novoUsuario = Usuario.builder()
                            .email(email)
                            .nome(nome)
                            .fotoPerfilUrl(fotoUrl)
                            .role(roleAtribuida)
                            .build();
                    return usuarioRepository.save(novoUsuario);
                });
    }

    private boolean isAdmin(String email) {
        if (email == null || emailsAdmin == null || emailsAdmin.isBlank()) {
            return false;
        }
        return Arrays.stream(emailsAdmin.split(","))
                .map(String::trim)
                .filter(e -> !e.isEmpty())
                .anyMatch(e -> e.equalsIgnoreCase(email));
    }

    public Usuario criarUsuario(UsuarioCriarDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictException("Email já cadastrado: " + dto.getEmail());
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .telefone(dto.getTelefone())
                .role("CLIENTE")
                .build();

        return usuarioRepository.save(usuario);
    }

    public Usuario obterPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario não encontrado com ID: " + id));
    }

    public Usuario obterPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario não encontrado com email: " + email));
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public List<Usuario> listarPorRole(String role) {
        return usuarioRepository.findByRole(role);
    }

    public Usuario atualizarUsuario(Long id, UsuarioCriarDTO dto) {
        Usuario usuario = obterPorId(id);

        if (!usuario.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictException("Email já cadastrado: " + dto.getEmail());
        }

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefone(dto.getTelefone());

        return usuarioRepository.save(usuario);
    }

    public Usuario atualizarTelefone(Long id, String telefone) {
        Usuario usuario = obterPorId(id);
        usuario.setTelefone(telefone);
        return usuarioRepository.save(usuario);
    }

    public void deletarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario não encontrado com ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    public Usuario buscarPorId(Long id) {
        return obterPorId(id);
    }
}