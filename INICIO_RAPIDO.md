# 🚀 GUIA DE INÍCIO RÁPIDO - SYRA

## ⚡ Inicialização em 3 Passos

### Passo 1: Docker
```powershell
cd C:\Users\08001\Projetos\syra\syra-backend
docker-compose up -d
```
✅ **Aguarde**: PostgreSQL, PgAdmin e MailHog iniciando...

---

### Passo 2: Backend
```powershell
cd C:\Users\08001\Projetos\syra\syra-backend
.\start.bat
```
✅ **Aguarde**: Spring Boot iniciando na porta 8080...

---

### Passo 3: Frontend
```powershell
cd C:\Users\08001\Projetos\syra\syra-frontend
npm run dev
```
✅ **Aguarde**: Vite iniciando na porta 5173...

---

## 🌐 Acesse o Sistema

### Frontend (Principal)
👉 **http://localhost:5173**

### Backend APIs
- Swagger (Documentação): http://localhost:8080/swagger-ui.html
- Endpoint base: http://localhost:8080/api

### Ferramentas
- PgAdmin (Banco): http://localhost:5050
  - Email: `admin@admin.com`
  - Senha: `admin`
- MailHog (Emails): http://localhost:8025

---

## 🧪 Testar a API

### Limpar o banco (opcional)
```powershell
cd C:\Users\08001\Projetos\syra\syra-backend
.\limpar-banco.bat
```
⚠️ **Apaga todos os dados** das tabelas. Use quando quiser começar do zero.

### Executar testes automatizados
```powershell
cd C:\Users\08001\Projetos\syra\syra-backend
.\teste-syra.bat
```

**Resultado esperado**: 14 testes com status 200, 201 ou 409 ✅

---

## 👤 Login no Sistema

### Opção 1: Login com Google (Recomendado)
1. Acesse http://localhost:5173
2. Clique em "Entrar com Google"
3. Autentique com sua conta Google
4. Redirecionamento automático

### Opção 2: Login de Desenvolvimento
1. Acesse http://localhost:5173
2. Clique em "Acesso local"
3. Preencha:
   - Nome: Seu nome
   - Email: Qualquer email
   - Foto: (opcional)

---

## 👑 Acesso Admin

Apenas estes emails têm acesso ao painel `/admin`:
- `erickgeovane2002@gmail.com`
- `valdilenehyuuga1@gmail.com`

---

## 🛑 Parar o Sistema

### Parar Backend
Pressione `Ctrl+C` no terminal do backend

### Parar Frontend
Pressione `Ctrl+C` no terminal do frontend

### Parar Docker
```powershell
cd C:\Users\08001\Projetos\syra\syra-backend
docker-compose down
```

---

## 🆘 Problemas Comuns

### ❌ Erro: "Container syra-db already in use"
```powershell
docker stop syra-db syra-pgadmin syra-mailhog
docker rm syra-db syra-pgadmin syra-mailhog
docker-compose up -d
```

### ❌ Backend não inicia (erro de compilação)
```powershell
cd C:\Users\08001\Projetos\syra\syra-backend
mvn clean compile
mvn spring-boot:run
```

### ❌ Frontend não conecta ao backend
1. Verifique se o backend está rodando na porta 8080
2. Abra http://localhost:8080/api/usuarios
3. Deve retornar JSON (mesmo que vazio)

### ❌ Login com Google não funciona
1. Use "Acesso local" temporariamente
2. Verifique as credenciais do Google no `application.properties`
3. Veja os logs do backend para erros OAuth2

---

## 📚 Documentação Completa

- **README.md**: Documentação principal do sistema
- **CORRECOES.md**: Correções técnicas aplicadas
- **TESTES.md**: Documentação completa dos testes
- **RESUMO.md**: Este documento (resumo executivo)

---

## ✅ Checklist de Validação

Após iniciar tudo, verifique:

- [ ] Docker rodando: `docker ps` mostra 3 containers
- [ ] Backend rodando: http://localhost:8080/api/usuarios retorna JSON
- [ ] Frontend rodando: http://localhost:5173 abre a página
- [ ] Login funciona (Google ou local)
- [ ] Teste da API passa: `.\teste-syra.bat`

---

**Tudo pronto?** 🎉 Comece a usar o sistema!

**Precisa de ajuda?** Consulte **README.md** para detalhes completos.

