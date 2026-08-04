package com.syra.config;

import com.syra.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // sem isto os @PreAuthorize dos controllers nao sao avaliados
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private com.syra.security.OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private com.syra.security.OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:8080",
                "https://syra-frontend.vercel.app" // <-- URL DA VERCEL ADICIONADA AQUI!
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults()) // Puxa as configurações do bean acima
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Infraestrutura e fluxo de login
                        .requestMatchers("/error", "/actuator/health").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                        // Vitrine publica: visitante nao logado ve servicos, produtos e horarios
                        .requestMatchers(HttpMethod.GET, "/api/servicos/**", "/api/produtos/**", "/api/horarios/**").permitAll()

                        // Dados de usuarios: so administrador. Listar clientes expoe nome,
                        // e-mail e telefone, entao nunca pode ficar aberto.
                        .requestMatchers("/api/usuarios", "/api/usuarios/role/**", "/api/usuarios/email/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")

                        // Agenda completa da loja: so administrador
                        .requestMatchers(HttpMethod.GET, "/api/agendamentos", "/api/agendamentos/status/**", "/api/agendamentos/periodo").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/agendamentos/*/confirmar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/agendamentos/**").hasRole("ADMIN")

                        // Escrita no catalogo: so administrador
                        .requestMatchers(HttpMethod.POST, "/api/servicos/**", "/api/produtos/**", "/api/horarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/servicos/**", "/api/produtos/**", "/api/horarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/servicos/**", "/api/produtos/**", "/api/horarios/**").hasRole("ADMIN")

                        // Qualquer outra rota exige login
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}