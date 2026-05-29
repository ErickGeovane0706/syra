# 🧪 TESTES DA API SYRA

## 🎯 Visão Geral

Este documento contém todos os testes necessários para validar a API SYRA. Os testes são executados automaticamente pelo script `teste-syra.bat`.

---

## 📋 Sequência de Testes

### **1. Verificação Inicial**
```bash
curl -X GET http://localhost:8080/api/usuarios
```
**Esperado**: Status 200 + array vazio `[]`

### **2. Criação de Usuários Admin**
```bash
# Admin 1
curl -X POST http://localhost:8080/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin Erick","email":"erickgeovane2002@gmail.com","senha":"admin123","cpf":"11111111111","role":"ADMIN","telefone":"11987654321"}'

# Admin 2
curl -X POST http://localhost:8080/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin Valdilene","email":"valdilenehyuuga1@gmail.com","senha":"admin123","cpf":"22222222222","role":"ADMIN","telefone":"11912345678"}'
```
**Esperado**: Status 201 para ambos

### **3. Criação de Usuário Cliente**
```bash
curl -X POST http://localhost:8080/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Cliente Teste","email":"cliente@teste.com","senha":"cliente123","cpf":"33333333333","role":"CLIENTE","telefone":"11999999999"}'
```
**Esperado**: Status 201

### **4. Listagem de Usuários**
```bash
curl -X GET http://localhost:8080/api/usuarios
```
**Esperado**: Status 200 + 3 usuários

### **5. Criação de Serviços**
```bash
# Serviço 1
curl -X POST http://localhost:8080/api/servicos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Consulta Médica","descricao":"Consulta clínica geral","duracao":30,"preco":150.00,"ativo":true}'

# Serviço 2
curl -X POST http://localhost:8080/api/servicos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Exame de Sangue","descricao":"Exames laboratoriais","duracao":15,"preco":80.00,"ativo":true}'
```
**Esperado**: Status 201 para ambos

### **6. Listagem de Serviços**
```bash
curl -X GET http://localhost:8080/api/servicos
```
**Esperado**: Status 200 + 2 serviços

### **7. Configuração de Horários**
```bash
# Segunda-feira
curl -X POST http://localhost:8080/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"diaSemana":"MONDAY","horaInicio":"09:00","horaFim":"17:00","ativo":true}'

# Terça-feira
curl -X POST http://localhost:8080/api/horarios \
  -H "Content-Type: application/json" \
  -d '{"diaSemana":"TUESDAY","horaInicio":"08:00","horaFim":"16:00","ativo":true}'
```
**Esperado**: Status 201 para ambos

### **8. Listagem de Horários**
```bash
curl -X GET http://localhost:8080/api/horarios
```
**Esperado**: Status 200 + 2 horários

### **9. Criação de Agendamento**
```bash
curl -X POST http://localhost:8080/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":3,"servicoId":1,"dataHora":"2026-03-15T10:00:00","observacoes":"Primeira consulta"}'
```
**Esperado**: Status 201

### **10. Listagem de Agendamentos**
```bash
curl -X GET http://localhost:8080/api/agendamentos
```
**Esperado**: Status 200 + 1 agendamento

### **11. Confirmação de Agendamento**
```bash
curl -X PATCH http://localhost:8080/api/agendamentos/1/confirmar
```
**Esperado**: Status 200

---

## ✅ Resultados Esperados

| Teste | Método | Endpoint | Status Esperado |
|-------|--------|----------|-----------------|
| 1 | GET | /usuarios | 200 |
| 2 | POST | /usuarios/register | 201 |
| 3 | POST | /usuarios/register | 201 |
| 4 | POST | /usuarios/register | 201 |
| 5 | GET | /usuarios | 200 |
| 6 | POST | /servicos | 201 |
| 7 | POST | /servicos | 201 |
| 8 | GET | /servicos | 200 |
| 9 | POST | /horarios | 201 |
| 10 | POST | /horarios | 201 |
| 11 | GET | /horarios | 200 |
| 12 | POST | /agendamentos | 201 |
| 13 | GET | /agendamentos | 200 |
| 14 | PATCH | /agendamentos/1/confirmar | 200 |

---

## 🔧 Como Executar

### **Automático (Recomendado)**
```bash
# Execute o script
.\teste-syra.bat
```

### **Manual (Passo a Passo)**
```bash
# 1. Verificar API
curl -X GET http://localhost:8080/api/usuarios

# 2. Criar admin 1
curl -X POST http://localhost:8080/api/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin Erick","email":"erickgeovane2002@gmail.com","senha":"admin123","cpf":"11111111111","role":"ADMIN","telefone":"11987654321"}'

# ... continuar com os outros testes
```

### **Postman**
1. Importe `Syra_API.postman_collection.json`
2. Execute as requisições em ordem

---

## 🚨 Possíveis Problemas

### **Status 302 (Redirect)**
- **Causa**: Autenticação bloqueando acesso
- **Solução**: Verificar SecurityConfig.java

### **Status 500 (Server Error)**
- **Causa**: Erro na aplicação
- **Solução**: Verificar logs do Spring Boot

### **Connection Refused**
- **Causa**: Aplicação não está rodando
- **Solução**: Executar `mvn spring-boot:run`

---

## 📊 Verificação de Dados

### **PgAdmin**
- URL: http://localhost:5050
- User: admin@syra.com.br
- Password: admin
- Database: syra_db

### **MailHog**
- URL: http://localhost:8025
- Verificar emails enviados

---

## 🎯 Checklist Final

- [ ] Aplicação iniciada (`mvn spring-boot:run`)
- [ ] Docker rodando (`docker ps`)
- [ ] API respondendo (status 200)
- [ ] Usuários criados (2 admins + 1 cliente)
- [ ] Serviços criados (2 serviços)
- [ ] Horários configurados (2 dias)
- [ ] Agendamento criado e confirmado
- [ ] Dados visíveis no PgAdmin

---

**Testes criados para validar completamente a API SYRA** ✅
