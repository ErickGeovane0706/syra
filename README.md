# Syra — agendamento e loja para salão de estética

Sistema de agendamento de serviços e catálogo de produtos para um salão, com login
via Google e painel administrativo para gerir a agenda, os serviços e o estoque.

Publicado em [syra-frontend.vercel.app](https://syra-frontend.vercel.app).

> **Sobre o estado do projeto:** o sistema está publicado, mas não tem uso corrente.
> Foi construído para um salão real e serve hoje como projeto de portfólio.

---

## Stack

**Backend** — Java 21, Spring Boot 3, PostgreSQL, Spring Security com OAuth2 e JWT
(jjwt), Cloudinary (imagens), Google Calendar API, springdoc-openapi.

**Frontend** — React 18, Vite, React Router, Axios.

**Infra local** — Docker Compose com PostgreSQL 15, MailHog (SMTP de teste) e pgAdmin.

**Deploy** — Vercel (frontend), Render (backend), Neon (PostgreSQL gerenciado).

---

## Funcionalidades

### Agendamento
Cliente escolhe o serviço e o horário dentro da grade de atendimento configurada.
Cada agendamento tem status (`PENDENTE`, `CONFIRMADO`, `CANCELADO`), controle de
concorrência otimista por `version` e sincronização opcional com o Google Calendar
do salão.

### Horários de atendimento
O salão define por dia da semana se atende e em qual janela. A agenda disponível é
derivada disso, não digitada à mão.

### Catálogo
Serviços com preço e duração, e produtos com imagem hospedada no Cloudinary.
Visitante não logado vê o catálogo; só administrador altera.

### Painel administrativo
Lista de agendamentos por período e por status, confirmação e cancelamento, e
gestão de serviços, produtos e horários.

---

## Autenticação e autorização

Login exclusivamente por **Google OAuth2**. Não há senha armazenada — o
`OAuth2LoginSuccessHandler` cria ou atualiza o usuário e emite um JWT.

A role vem de uma lista de e-mails administradores lida da variável de ambiente
`ADMIN_EMAILS`. Quem não está na lista entra como `CLIENTE`.

As regras de acesso ficam em `SecurityConfig`:

| Rota | Quem acessa |
|---|---|
| `GET /api/servicos`, `/api/produtos`, `/api/horarios` | qualquer visitante |
| `GET /api/usuarios/me` | o próprio usuário, identificado pelo token |
| `GET /api/usuarios`, `/role/**`, `/email/**` | apenas `ADMIN` |
| Agenda completa, confirmação e exclusão | apenas `ADMIN` |
| Escrita no catálogo | apenas `ADMIN` |
| Qualquer outra rota | exige login |

**Por que a lista de admins vem do ambiente e não do código:** e-mail é dado
pessoal. Fixá-lo no fonte significa versioná-lo, e um repositório público passa a
distribuir o dado a cada clone.

**Por que existe `/api/usuarios/me`:** o frontend precisa do registro do usuário
logado. Buscar por `/api/usuarios/email/{email}` resolveria, mas aceitaria um
e-mail arbitrário na URL — bastaria trocar o parâmetro para ler o cadastro alheio.
Com `/me`, a identidade vem do token e não há parâmetro para adulterar.

---

## Rodando local

**Pré-requisitos:** Java 21, Maven, Node 18+, Docker.

### 1. Infraestrutura

```bash
cd syra-backend
docker compose up -d
```

Sobe PostgreSQL (5432), MailHog (UI em 8025) e pgAdmin (5050).

### 2. Variáveis de ambiente

O backend lê tudo do ambiente. Para desenvolvimento, crie
`syra-backend/src/main/resources/application-local.properties` — ele está no
`.gitignore` e **não deve ser commitado**.

| Variável | Obrigatória | Para quê |
|---|---|---|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | sim | PostgreSQL |
| `JWT_SECRET` | sim | assinatura dos tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | sim | login OAuth2 |
| `GOOGLE_REDIRECT_URI` | sim | callback do OAuth2 |
| `ADMIN_EMAILS` | sim | e-mails com papel de administrador, separados por vírgula |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | imagens | upload de fotos de produto |
| `GOOGLE_CALENDAR_*` | opcional | sincronização da agenda |
| `CORS_ORIGINS` | não | origens liberadas |

Sem `ADMIN_EMAILS` o sistema sobe normalmente, mas ninguém tem acesso ao painel.

### 3. Backend

```bash
cd syra-backend
./mvnw spring-boot:run     # http://localhost:8080
```

Swagger em `http://localhost:8080/swagger-ui.html`.

### 4. Frontend

```bash
cd syra-frontend
npm install
npm run dev                # http://localhost:5173
```

Defina `VITE_API_URL` apontando para o backend.

---

## Estrutura

```
syra-backend/src/main/java/com/syra/
├── controller/     # Agendamento, Usuario, Servico, Produto, HorarioAtendimento
├── service/        # regras de negócio + integrações (Cloudinary, Google Calendar)
├── models/         # entidades JPA
├── repositories/   # Spring Data
├── security/       # filtro JWT, handlers do OAuth2, UserDetailsService
├── config/         # SecurityConfig, CORS, tratamento de exceções
└── dto/

syra-frontend/src/
├── pages/          # Home, Services, Booking, Products, MyAppointments, Admin, Contact
├── components/
└── services/api.js # cliente axios com injeção do token
```

---

## Nota sobre segurança

Este repositório passou por uma auditoria depois de publicado. Três problemas
foram encontrados e corrigidos:

1. **API sem autorização.** O `SecurityConfig` tinha `.anyRequest().permitAll()`
   com o comentário `// Permitir tudo para testes (remover depois)`. Nenhum
   endpoint exigia autenticação: era possível listar todos os usuários com seus
   dados de contato, apagar qualquer cadastro e criar usuário com papel de
   administrador. Substituído por regras explícitas por rota e método.

2. **`@PreAuthorize` inerte.** As anotações existiam no `ProdutoController`, mas
   faltava `@EnableMethodSecurity` — então nunca eram avaliadas. Uma autorização
   que parece existir é pior que nenhuma, porque ninguém vai procurar o buraco.

3. **Dados pessoais versionados.** A lista de administradores estava fixa no
   código, expondo e-mails reais em repositório público. Movida para a variável
   `ADMIN_EMAILS`, e o histórico do Git foi reescrito.

Também foi removido o endpoint de "login de desenvolvimento", que criava sessão a
partir de um e-mail digitado — na prática, um caminho para virar administrador.

---

## Limitações conhecidas

**IDOR em rotas por id.** `GET /api/usuarios/{id}` e
`GET /api/agendamentos/cliente/{usuarioId}` exigem login, mas não verificam se o
id pertence a quem está chamando. Um cliente autenticado ainda consegue ler o
cadastro de outro trocando o número na URL. O `/me` já é o caminho correto para o
frontend; falta restringir as rotas por id ao dono ou a `ADMIN`.

**Token no query string.** O `OAuth2LoginSuccessHandler` devolve o JWT como
parâmetro de URL no redirecionamento para o frontend. Isso deixa o token no
histórico do navegador e em logs de proxy. O correto seria usar fragmento (`#`) ou
um código de troca de uso único.

**Sem migrations.** `ddl-auto=update` deixa o Hibernate alterar o schema conforme
as entidades mudam. Funciona em desenvolvimento e é arriscado em produção.

**Cobertura de testes baixa.** Há um único arquivo de teste. A verificação hoje é
manual, via Swagger e pela coleção do Postman em `syra-backend/`.

**Rate limiting ausente.** Não há limite de requisições em nenhuma rota.
