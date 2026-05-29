package com.syra.security;

import com.syra.models.Usuario;
import com.syra.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado com email: " + email));

        return new org.springframework.security.core.userdetails.User(
                usuario.getEmail(),
                "", // Senha vazia, pois usamos OAuth2
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRole()))
        );
    }
}

