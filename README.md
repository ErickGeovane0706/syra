# 📚 DOCUMENTAÇÃO SYRA - SISTEMA DE AGENDAMENTO

> 📑 **Índice Completo da Documentação**: [INDICE.md](INDICE.md)  
> 🚀 **Início Rápido?** Veja [INICIO_RAPIDO.md](INICIO_RAPIDO.md)  
> 📝 **Resumo Executivo?** Veja [RESUMO.md](RESUMO.md)  
> 🔧 **Correções Aplicadas?** Veja [CORRECOES.md](CORRECOES.md)  
> 🧪 **Testes da API?** Veja [syra-backend/TESTES.md](syra-backend/TESTES.md)

---

## 🎯 SOBRE O PROJETO

Sistema web completo de agendamento de consultas com autenticação Google OAuth2, desenvolvido com:
- **Backend**: Spring Boot (Java) + PostgreSQL
- **Frontend**: React (Vite) + Axios

---

## 🚀 COMO INICIAR O SISTEMA

### 1. Inicie o Docker (PostgreSQL + PgAdmin + MailHog)
```bash
cd C:\Users\08001\Projetos\syra\syra-backend
docker-compose up -d
```

### 2. Inicie o Backend (Spring Boot)
```bash
cd C:\Users\08001\Projetos\syra\syra-backend
start.bat
# ou execute direto no IntelliJ IDEA
```

### 3. Inicie o Frontend (React)
```bash
cd C:\Users\08001\Projetos\syra\syra-frontend
npm install   # apenas na primeira vez
npm run dev
```

### 4. Acesse o sistema
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Swagger (docs)**: http://localhost:8080/swagger-ui.html
- **PgAdmin**: http://localhost:5050 (admin@admin.com / admin)
- **MailHog**: http://localhost:8025

---

## 👥 USUÁRIOS ADMINISTRADORES

Apenas estes e-mails têm acesso ao painel admin (`/admin`):
- `erickgeovane2002@gmail.com`
- `valdilenehyuuga1@gmail.com`

Qualquer outro e-mail terá role **CLIENTE**.

---

## 🔐 AUTENTICAÇÃO

### Login com Google (OAuth2)
1. Clique em "Entrar com Google" no header
2. Será redirecionado para o Google
3. Após autenticação, retorna automaticamente ao frontend com:
   - Email, nome, foto
   - Token JWT (salvo automaticamente)
   - Role (ADMIN ou CLIENTE)

### Login de Desenvolvimento (sem Google)
1. Clique em "Acesso local"
2. Preencha: nome, email, foto (opcional)
3. Sistema cria/atualiza usuário no banco

---

## 📋 FUNCIONALIDADES

### Para CLIENTES
- ✅ Ver serviços disponíveis
- ✅ Ver horários de atendimento
- ✅ Criar agendamentos
- ✅ Ver seus próprios agendamentos
- ✅ Página de contato

### Para ADMINISTRADORES
- ✅ Tudo que o cliente pode fazer
- ✅ **Gerenciar horários de atendimento** (painel `/admin`)
- ✅ Ver todos os agendamentos
- ✅ Confirmar/cancelar agendamentos

---

## 🧪 TESTES AUTOMATIZADOS

### Limpar o banco de dados
```bash
cd C:\Users\08001\Projetos\syra\syra-backend
limpar-banco.bat
```

⚠️ **ATENÇÃO**: Este script apaga TODOS os dados das tabelas (usuários, serviços, horários, agendamentos). Use antes de executar os testes ou quando quiser começar do zero.

### Testar toda a API
```bash
cd C:\Users\08001\Projetos\syra\syra-backend
teste-syra.bat
```

Este script testa:
1. Criação dos usuários admin
2. Criação de usuário cliente
3. Listagem de usuários
4. Criação de serviços
5. Configuração de horários
6. Criação de agendamentos
7. Confirmação de agendamentos

**Resultados esperados**: Status 200, 201 ou 409 (conflito = já existe)

### Testar no Postman
1. Abra o Postman
2. Importe: `Syra_API.postman_collection.json`
3. Execute a collection

---

## 📁 ESTRUTURA DO PROJETO

```
syra/
├── syra-backend/           # Spring Boot
│   ├── src/main/java/com/syra/
│   │   ├── config/         # Configurações (CORS, Security, Exception Handler)
│   │   ├── controller/     # REST Controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── models/         # Entidades JPA
│   │   ├── repositories/   # Repositories JPA
│   │   ├── security/       # JWT, OAuth2, Filters
│   │   └── service/        # Regras de negócio
│   ├── compose.yaml        # Docker (PostgreSQL, PgAdmin, MailHog)
│   ├── teste-syra.bat      # Script de testes
│   └── Syra_API.postman_collection.json
│
└── syra-frontend/          # React + Vite
    ├── src/
    │   ├── components/     # Componentes reutilizáveis
    │   ├── pages/          # Páginas principais
    │   ├── services/       # API calls (axios)
    │   └── App.jsx         # Componente principal
    └── vite.config.js      # Proxy para backend
```

---

## 🔧 CONFIGURAÇÕES IMPORTANTES

### Backend (`application.properties`)
```properties
# PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/syra_db
spring.datasource.username=admin
spring.datasource.password=admin

# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=SEU_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=SEU_CLIENT_SECRET
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google

# JWT
app.jwt.secret=sua_chave_secreta_super_forte_com_minimo_32_caracteres_para_HS256
app.jwt.expiration=3600000
```

### Frontend (Proxy Vite)
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8080',
    '/oauth2': 'http://localhost:8080',
    '/login': 'http://localhost:8080'
  }
}
```

---

## ❓ SOLUÇÃO DE PROBLEMAS

### 1. Erro: "Container name syra-db already in use"
```bash
docker stop syra-db syra-pgadmin syra-mailhog
docker rm syra-db syra-pgadmin syra-mailhog
docker-compose up -d
```

### 2. Erro 500 no login Google
- Verifique se o `OAuth2LoginSuccessHandler` está configurado
- Verifique as credenciais do Google no `application.properties`
- Veja os logs do backend para detalhes

### 3. Erro "Invalid credentials" no login
- Para login com Google: certifique-se que redirecionou corretamente
- Para login local: verifique se o endpoint `/api/usuarios/teste` está funcionando

### 4. Frontend não conecta ao backend
- Verifique se o backend está rodando na porta 8080
- Verifique o proxy no `vite.config.js`
- Abra o console do navegador para ver erros de CORS

### 5. Token JWT não está sendo enviado
- Verifique o localStorage: `syra.token`
- Verifique o interceptor no `api.js`
- Veja as requisições na aba Network do navegador

---

## 📞 ENDPOINTS PRINCIPAIS DA API

### Usuários
- `POST /api/usuarios/register` - Criar usuário
- `GET /api/usuarios` - Listar todos
- `GET /api/usuarios/email/{email}` - Buscar por email
- `GET /api/usuarios/role/{role}` - Listar por role
- `POST /api/usuarios/teste` - Login de desenvolvimento

### Serviços
- `POST /api/servicos` - Criar serviço
- `GET /api/servicos` - Listar todos
- `GET /api/servicos/buscar/{nome}` - Buscar por nome

### Horários
- `POST /api/horarios` - Criar/atualizar horário
- `GET /api/horarios` - Listar todos
- `GET /api/horarios/dia/{dia}` - Buscar por dia da semana

### Agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos` - Listar todos
- `GET /api/agendamentos/periodo` - Listar por período
- `PATCH /api/agendamentos/{id}/confirmar` - Confirmar
- `PATCH /api/agendamentos/{id}/cancelar` - Cancelar

---

## 🎨 TECNOLOGIAS UTILIZADAS

### Backend
- Spring Boot 3.5.11
- Spring Security (OAuth2, JWT)
- Spring Data JPA
- PostgreSQL
- Lombok
- Swagger/OpenAPI
- Docker Compose

### Frontend
- React 18
- Vite
- React Router
- Axios
- CSS3 (sem framework CSS)

---

## ✅ STATUS DO PROJETO

- ✅ Backend funcionando
- ✅ Frontend funcionando
- ✅ Autenticação OAuth2 Google configurada
- ✅ Autenticação JWT implementada
- ✅ CRUD completo de usuários
- ✅ CRUD completo de serviços
- ✅ CRUD completo de horários
- ✅ CRUD completo de agendamentos
- ✅ Testes automatizados
- ✅ Docker configurado
- ✅ Documentação completa

---

**Desenvolvido por Erick e Valdilene - 2026**

