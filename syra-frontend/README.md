# SYRA – Frontend React + Vite

Frontend da Syra Estética construído com React, Vite e integração com o backend Spring Boot.

## O que este projeto entrega

- Home renovada com hero usando `public/hero-syra.jpg`
- Páginas separadas para início, serviços, agendamento, contato e admin
- Consumo dos endpoints reais de serviços, horários, usuários e agendamentos
- Painel admin para configurar dias e horários de atendimento
- Agenda inteligente para clientes baseada em:
  - serviço escolhido
  - duração do serviço
  - expediente semanal configurado
  - agendamentos já existentes
- Login principal via Google por redirecionamento ao backend
- Fallback de acesso local usando `POST /api/usuarios/teste` para desenvolvimento

## Estrutura

```text
syra-frontend/
  public/
    hero-syra.jpg
    favicon.svg
  src/
    components/
      AuthModal.jsx
      Footer.jsx
      Header.jsx
      ScheduleCard.jsx
      ServiceCard.jsx
    pages/
      AdminPage.jsx
      BookingPage.jsx
      ContactPage.jsx
      HomePage.jsx
      NotFoundPage.jsx
      ServicesPage.jsx
    services/
      api.js
    styles/
      global.css
    utils/
      scheduling.js
    App.jsx
    main.jsx
```

## Pré-requisitos

- Node.js 18+
- Backend Spring Boot rodando em `http://localhost:8080`

## Como rodar

```powershell
cd C:\Users\08001\Projetos\syra\syra-frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Integração com o backend

O frontend usa o proxy do Vite para chamar o backend por `'/api'`, `'/oauth2'` e `'/login'`.

Endpoints usados hoje:

- `GET /api/servicos`
- `GET /api/horarios`
- `POST /api/horarios`
- `PUT /api/horarios/{id}`
- `GET /api/usuarios/email/{email}`
- `GET /api/usuarios/role/ADMIN`
- `POST /api/usuarios/register`
- `PUT /api/usuarios/{id}/telefone`
- `POST /api/usuarios/teste`
- `GET /api/agendamentos/periodo`
- `POST /api/agendamentos`

## Fluxo atual de acesso

### Cliente

1. Faz login com Google pelo botão do topo.
2. Se o backend ainda não estiver redirecionando de volta ao frontend, pode usar o acesso local de desenvolvimento.
3. Escolhe o serviço, o dia e um horário disponível calculado automaticamente.

### Admin

1. Faz login com um e-mail já cadastrado como `ADMIN` no backend.
2. O frontend consulta `GET /api/usuarios/role/ADMIN` para liberar a rota `/admin`.
3. No painel admin, configura dias de trabalho, abertura, fechamento e intervalo.

## Observação importante sobre Google Login

O botão de Google já redireciona para o backend em `/oauth2/authorization/google`.
Se, depois da autenticação, o backend ainda não voltar para o frontend, o problema está no fluxo de callback/redirecionamento do backend — não no layout do frontend. Enquanto isso, o projeto mantém o acesso local para desenvolvimento.

## Build

```powershell
npm run build
npm run preview
```
