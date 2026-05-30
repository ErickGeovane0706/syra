# Syra Estética - Sistema Inteligente de Agendamento

Este repositório contém a arquitetura completa do **Syra**, um sistema especializado de gerenciamento e agendamento inteligente de horários projetado para automatizar as operações de uma clínica de estética.

O projeto foi concebido sob o paradigma de **Arquitetura de Custo Zero (Zero-Cost Cloud Architecture)**, integrando serviços de nuvem de ponta em suas camadas gratuitas para entregar resiliência, segurança de nível corporativo e pipelines automatizados de Integração e Entrega Contínua (CI/CD), sem gerar custos operacionais de infraestrutura.

---

## 1. Visão Geral da Arquitetura

O ecossistema é dividido em camadas totalmente desacopladas, garantindo isolamento de responsabilidades e escalabilidade independente:

```text
┌─────────────────────────┐      HTTPS (JWT / CORS)      ┌─────────────────────────┐
│     Vercel Frontend     │─────────────────────────────>│       Render API        │
│     (React + Vite)      │<─────────────────────────────│      (Spring Boot)      │
└─────────────────────────┘                              └─────────────────────────┘
             │                                                │               │
             │ HTTPS (Imagens)                  JDBC / SQL ◄──┘               │ HTTPS (Upload)
             ▼                                                                ▼
┌─────────────────────────┐                      ┌─────────────────────────┐
│   Cloudinary (CDN)      │                      │      Neon Database      │
│  (Media & Image Host)   │                      │   (Serverless Postgres) │
└─────────────────────────┘                      └─────────────────────────┘

Camada de Persistência (Database): Hospedada no Neon, uma plataforma de banco de dados PostgreSQL serverless com computação e armazenamento separados, garantindo alta performance sob demanda.

Camada de Negócio (Backend): Desenvolvida em Java e Spring Boot 3, hospedada no Render. A API encapsula a lógica de agendamento, validação de regras de negócio, persistência de dados via Spring Data JPA/Hibernate e controle de acesso rigoroso.

Camada de Apresentação (Frontend): Desenvolvida em React (Vite) e hospedada na Vercel. Entrega uma interface rica, responsiva, otimizada para SEO e distribuída globalmente via redes de borda (Edge CDN).

Armazenamento de Mídia (CDN): Gerenciado pelo Cloudinary, garantindo o upload seguro e a entrega ultrarrápida de imagens através de uma rede de distribuição global, contornando a limitação de discos efêmeros da camada de backend.



2. A Motivação da Arquitetura Zero-Cost
A escolha das tecnologias foi guiada pelo desafio de engenharia de implantar um ecossistema de software completo na nuvem com gasto zero, mantendo as melhores práticas exigidas pelo mercado de desenvolvimento de software moderno:

Isolamento de Ambientes: Uso de banco de dados com recursos modernos (Serverless Engine) integrado com deploys independentes.

Segurança Avançada: Implementação de autenticação delegada via provedores globais de identidade (Google OAuth2), criptografia de tráfego (HTTPS/TLS) e segurança a nível de endpoints com Tokens JWT estritos.

Automação de Infraestrutura (GitOps): Configuração de esteiras automatizadas de build e deploy acionadas via hooks do repositório Git, eliminando intervenções manuais em servidores públicos.

Resiliência de Arquivos Estáticos: Contorno da limitação de discos efêmeros (PaaS free-tiers) delegando o armazenamento e a entrega de imagens pesadas para um CDN dedicado (Cloudinary), garantindo persistência permanente e otimização automática de mídia.

3. Detalhamento Técnico e Configuração por Camada
3.1. Banco de Dados: Neon (Serverless PostgreSQL)
O Neon atua como o motor de dados do sistema, fornecendo uma instância gerenciada do PostgreSQL.

Configuração de Inicialização: Durante o primeiro deploy, a propriedade spring.jpa.hibernate.ddl-auto=update do backend instrui o Hibernate a varrer as entidades anotadas (como Usuario.java, Servico.java, Agendamento.java) e gerar a estrutura de tabelas automaticamente na branch de produção do Neon.

Carga Inicial de Dados (Seeding): O acesso e gerenciamento administrativo inicial do banco de dados são executados diretamente no painel do Neon através do SQL Editor. Para popular as permissões do sistema, foram inseridos registros nativos definindo os e-mails administrativos oficiais do Google correspondentes aos operadores do sistema.

3.2. Backend: Render (Spring Boot API)
O backend foi provisionado como um Web Service no Render, compilando a aplicação Java a partir do código-fonte e executando o microsserviço continuamente.

Segurança e Validação CORS (Cross-Origin Resource Sharing): Por estar hospedada em um domínio diferente do frontend, a API foi blindada nativamente contra acessos não autorizados de navegadores externos através do SecurityConfig.java. O bean CorsConfigurationSource mapeia restritivamente os domínios aceitos.

Gerenciamento de Estado Stateless: O Spring Security força uma política de criação de sessão sem estado (SessionCreationPolicy.STATELESS), delegando a validação de cada requisição subsequente ao filtro customizado JwtAuthenticationFilter.

3.3. Frontend: Vercel (React + Vite)
O frontend foi importado na Vercel como um projeto SPA (Single Page Application) com o preset do Vite, permitindo compilações otimizadas e entregas instantâneas.

Escopo de Variáveis de Ambiente: Para se comunicar de forma transparente com o backend sem chubar strings estáticas no código de produção, o React consome a variável global VITE_API_URL.

Ajuste de Rotas de Produção: No ecossistema local, os redirecionamentos do Axios funcionavam através do proxy interno do Vite. No ambiente de nuvem, a variável VITE_API_URL foi explicitamente mapeada na Vercel apontando para o endpoint absoluto da API no Render (https://syra-vw69.onrender.com/api), garantindo que todas as chamadas HTTP assíncronas alcancem os controladores corretos do Spring Boot.

3.4. Armazenamento de Mídia: Cloudinary (Image Host & CDN)
Devido à natureza efêmera dos sistemas de arquivos em plataformas de hospedagem gratuitas e PaaS (como o Render), o armazenamento local de arquivos não é uma opção viável. O Cloudinary foi integrado como a solução definitiva para o gerenciamento de mídia estática.

Upload Desacoplado: Quando um administrador faz o upload de uma imagem via frontend, o arquivo multipart é interceptado pelo Spring Boot, que atua apenas como um conduíte seguro. A API envia o buffer diretamente para os servidores do Cloudinary através da sua SDK oficial.

Persistência Leve: O Cloudinary processa a imagem, gera uma URL pública otimizada e devolve para o backend. O banco de dados (Neon) salva apenas essa URL como uma String, mantendo as tabelas extremamente leves e rápidas de consultar.

Entrega Otimizada (CDN): Na hora de exibir a imagem para o cliente final, o frontend (Vercel) consome a imagem diretamente da rede de distribuição global do Cloudinary, poupando a banda da nossa API no Render e garantindo um carregamento quase instantâneo na interface.

4. O Fluxo de Autenticação Integrado (Google OAuth2 + JWT)
Um dos maiores desafios de engenharia do projeto foi a transposição do fluxo de login social do ambiente de desenvolvimento local para os domínios de produção em nuvem. O fluxo integrado funciona da seguinte maneira:

Início do Fluxo: O usuário clica em "Entrar com Google" no frontend. A função executa um redirecionamento forçado para a rota de inicialização do Spring Security no backend.

Validação no Provedor: O backend redireciona o cliente para os servidores do Google Auth. Após a inserção segura das credenciais, o Google valida a identidade do cliente.

Retorno de Código de Autenticação: O Google devolve o controle da sessão para o backend através da URI de redirecionamento previamente homologada e protegida no Google Cloud Console (/login/oauth2/code/google).

Processamento de Sucesso: A classe OAuth2LoginSuccessHandler.java intercepta a autenticação bem-sucedida, extrai os metadados do perfil (e-mail, nome, foto), invoca o UsuarioService para criar ou sincronizar o usuário no Neon, e gera um Token JWT assinado digitalmente.

Redirecionamento Seguro: O backend monta uma URL de retorno apontando estritamente para o domínio de produção do frontend na Vercel, injetando o token e as permissões do usuário (role) como parâmetros de query seguros.

Captura no React: O App.jsx lê os parâmetros da URL, armazena o token JWT de forma segura no localStorage, limpa os parâmetros visíveis da barra de navegação para manter a estética visual limpa da URL e atualiza o estado global da sessão.

5. Engenharia de Produção e Resolução de Problemas Reais
Durante a janela de migração do sistema do ambiente local para a nuvem, foram resolvidos problemas críticos de integração, que servem como documentação valiosa de engenharia para este repositório:

O Desafio do Bloqueio de CORS
Problema: Ao subir o front-end e realizar as primeiras chamadas, o console do navegador retornava erros estritos de Access-Control-Allow-Origin.

Solução: Identificou-se que o Spring Security bloqueava requisições de domínios externos por padrão. A configuração foi sanada unificando o controle de CORS diretamente na cadeia de filtros do Spring Security (SecurityConfig.java), liberando explicitamente as requisições autenticadas da Vercel.


Correção de Redirecionamentos Absolutos do OAuth2
Problema: O login com o Google enviava o usuário para os servidores externos com sucesso, mas no momento de retornar à aplicação, o usuário era devolvido para o endereço de desenvolvimento local, gerando falhas catastróficas de conexão.

Solução: O problema residia nos arquivos internos de tratamento de eventos de autenticação (OAuth2LoginSuccessHandler e OAuth2LoginFailureHandler), que possuíam caminhos locais fixados estaticamente. Os manipuladores foram refatorados utilizando o UriComponentsBuilder para apontar diretamente para a URL de produção na Vercel. As rotas também foram homologadas no console corporativo do Google Cloud Platform.

Resolução de Conflitos Estáticos em Linha de Pipeline (Merge Conflicts)
Problema: Novas telas e regras visuais de gerenciamento de produtos foram construídas em uma branch de desenvolvimento isolada. Ao tentar integrar o código à branch principal (main) para disparar a automação de deploy da Vercel, o Git barrou o processo apontando conflitos estruturais no arquivo de estilização global global.css.

Solução: O processo de build automático foi pausado temporariamente. Utilizou-se o motor de resolução visual de conflitos tridimensionais (Three-Way Merge) do IDE para analisar as linhas concorrentes na folha de estilos. A versão de produção foi reconciliada aplicando os elementos de layout corretos, o estado do repositório foi limpo via terminal com comandos de indexação e commit, e o push final acionou o build definitivo na Vercel de forma limpa.

6. Como Executar o Projeto Localmente Conectado à Nuvem
Se desejar executar o frontend localmente no seu computador (localhost:5173) consumindo os dados reais e o ecossistema de autenticação que já estão rodando na nuvem, siga este procedimento de isolamento de variáveis:

Navegue até a pasta raiz do frontend.

Crie um arquivo local de configuração de ambiente chamado .env (este arquivo está listado no .gitignore e nunca deve ser enviado publicamente).

Adicione exatamente a seguinte linha apontando para a API de produção:


Snippet de código
VITE_API_URL=[https://syra-vw69.onrender.com/api](https://syra-vw69.onrender.com/api)
Reinicie o servidor de desenvolvimento do Vite:

Bash
npm run dev
O projeto iniciará localmente mas usará toda a inteligência e o banco de dados do ambiente de produção.