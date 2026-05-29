package com.syra.security;

import com.syra.models.Usuario;
import com.syra.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Extrair dados do usuário do Google
        String email = oAuth2User.getAttribute("email");
        String nome = oAuth2User.getAttribute("name");
        String fotoUrl = oAuth2User.getAttribute("picture");

        // Processar login no banco (cria ou atualiza o usuário)
        Usuario usuario = usuarioService.processarLoginGoogle(email, nome, fotoUrl);

        // Gerar token JWT
        String token = jwtUtil.generateToken(usuario.getEmail(), new java.util.HashMap<>());

        // Redirecionar para o frontend com os dados do usuário
        String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:5173")
                .queryParam("email", email)
                .queryParam("nome", URLEncoder.encode(nome != null ? nome : "", StandardCharsets.UTF_8))
                .queryParam("foto", URLEncoder.encode(fotoUrl != null ? fotoUrl : "", StandardCharsets.UTF_8))
                .queryParam("role", usuario.getRole())
                .queryParam("token", token)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}

