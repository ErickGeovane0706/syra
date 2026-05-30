package com.syra.controller;


import com.syra.dto.ProdutoRequestDTO;
import com.syra.dto.ProdutoResponseDTO;
import com.syra.service.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProdutoResponseDTO> criar(
            @ModelAttribute ProdutoRequestDTO dto,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) throws IOException {

        ProdutoResponseDTO response = produtoService.criar(dto, imagem);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProdutoResponseDTO> atualizar(
            @PathVariable Long id,
            @ModelAttribute ProdutoRequestDTO dto,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) throws IOException {

        ProdutoResponseDTO response = produtoService.atualizar(id, dto, imagem);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }
}