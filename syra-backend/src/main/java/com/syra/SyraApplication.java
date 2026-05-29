package com.syra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SyraApplication {

	public static void main(String[] args) {
		SpringApplication.run(SyraApplication.class, args);
	}

}
