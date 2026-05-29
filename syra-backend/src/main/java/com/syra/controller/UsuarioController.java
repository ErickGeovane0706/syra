package com.syra.controller;

import com.syra.dto.UsuarioCriarDTO;
import com.syra.models.TelefoneDTO;
import com.syra.models.Usuario;
import com.syra.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário")
    public ResponseEntity<Usuario> registrarUsuario(@Valid @RequestBody UsuarioCriarDTO dto) {
        Usuario usuario = usuarioService.criarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @GetMapping
    @Operation(summary = "Listar todos os usuários")
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter usuário por ID")
    public ResponseEntity<Usuario> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obterPorId(id));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Obter usuário por email")
    public ResponseEntity<Usuario> obterPorEmail(@PathVariable String email) {
        return ResponseEntity.ok(usuarioService.obterPorEmail(email));
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Listar usuários por role")
    public ResponseEntity<List<Usuario>> listarPorRole(@PathVariable String role) {
        return ResponseEntity.ok(usuarioService.listarPorRole(role));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar usuário")
    public ResponseEntity<Usuario> atualizarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioCriarDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, dto));
    }

    @PutMapping("/{id}/telefone")
    @Operation(summary = "Atualizar telefone do usuário")
    public ResponseEntity<Usuario> atualizarTelefone(
            @PathVariable Long id,
            @RequestBody TelefoneDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizarTelefone(id, dto.numero()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar usuário (admin only)")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        usuarioService.deletarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/teste")
    @Operation(summary = "Teste de login via Google (desenvolvimento)")
    public ResponseEntity<Usuario> criarTeste(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.processarLoginGoogle(
                usuario.getEmail(),
                usuario.getNome(),
                usuario.getFotoPerfilUrl()
        ));
    }
}
