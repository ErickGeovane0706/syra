package com.syra.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

@Component
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private static final Logger logger = Logger.getLogger(OAuth2LoginFailureHandler.class.getName());

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {

        logger.warning("OAuth2 Authentication failed: " + exception.getMessage());

        // Redirecionar para o frontend com mensagem de erro
        String errorMessage = URLEncoder.encode("Falha na autenticação OAuth2. Tente novamente.", StandardCharsets.UTF_8);

        // URL DA VERCEL AQUI
        String redirectUrl = "https://syra-frontend.vercel.app?error=" + errorMessage;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}