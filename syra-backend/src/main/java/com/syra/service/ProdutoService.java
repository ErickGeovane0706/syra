package com.syra.service;


import com.syra.dto.ProdutoRequestDTO;
import com.syra.dto.ProdutoResponseDTO;
import com.syra.models.Produto;
import com.syra.repositories.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FileUploadService fileUploadService;

    public ProdutoService(ProdutoRepository produtoRepository, FileUploadService fileUploadService) {
        this.produtoRepository = produtoRepository;
        this.fileUploadService = fileUploadService;
    }

    @Transactional
    public ProdutoResponseDTO criar(ProdutoRequestDTO dto, MultipartFile imagem) throws IOException {
        Produto produto = new Produto();
        produto.setTitulo(dto.getTitulo());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setEstoque(dto.getEstoque());

        // Upload da imagem (se enviada)
        if (imagem != null && !imagem.isEmpty()) {
            Map<String, Object> uploadResult = fileUploadService.upload(imagem);
            produto.setImagemUrl((String) uploadResult.get("secure_url"));
            produto.setPublicId((String) uploadResult.get("public_id"));
        }

        Produto salvo = produtoRepository.save(produto);
        return toResponseDTO(salvo);
    }

    public List<ProdutoResponseDTO> listarTodos() {
        return produtoRepository.findByAtivoTrueOrderByDataCriacaoDesc()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ProdutoResponseDTO buscarPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        return toResponseDTO(produto);
    }

    private ProdutoResponseDTO toResponseDTO(Produto produto) {
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getTitulo(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getEstoque(),
                produto.getImagemUrl(),
                produto.getAtivo(),
                produto.getDataCriacao()
        );
    }
    @Transactional
    public ProdutoResponseDTO atualizar(Long id, ProdutoRequestDTO dto, MultipartFile imagem) throws IOException {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setTitulo(dto.getTitulo());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setEstoque(dto.getEstoque());

        // Se uma nova imagem foi enviada, faz o upload e substitui a antiga
        if (imagem != null && !imagem.isEmpty()) {
            Map<String, Object> uploadResult = fileUploadService.upload(imagem);
            produto.setImagemUrl((String) uploadResult.get("secure_url"));
            produto.setPublicId((String) uploadResult.get("public_id"));

            // Opcional: Aqui você também poderia adicionar a lógica para deletar a imagem
            // antiga do Cloudinary usando o publicId anterior, para não acumular lixo lá.
        }

        Produto atualizado = produtoRepository.save(produto);
        return toResponseDTO(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Soft delete: Apenas desativa o produto em vez de apagar do banco
        produto.setAtivo(false);
        produtoRepository.save(produto);
    }
}