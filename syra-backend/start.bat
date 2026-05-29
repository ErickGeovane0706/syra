@echo off
REM ================================================
REM Script de inicializacao rapida do Syra Backend
REM ================================================

echo.
echo 🚀 Iniciando Syra Backend...
echo.

REM 1. Verificar Docker
echo ✓ Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Docker nao encontrado. Por favor, instale Docker.
    pause
    exit /b 1
)

REM 2. Iniciar Docker Compose
echo ✓ Iniciando containers Docker...
docker-compose up -d
if errorlevel 1 (
    echo ✗ Erro ao iniciar Docker Compose
    pause
    exit /b 1
)

REM 3. Aguardar PostgreSQL iniciar
echo ✓ Aguardando PostgreSQL iniciar...
timeout /t 5 /nobreak

REM 4. Compilar projeto
echo ✓ Compilando projeto...
call mvnw clean install
if errorlevel 1 (
    echo ✗ Erro na compilacao
    pause
    exit /b 1
)

REM 5. Iniciar aplicacao
echo ✓ Iniciando aplicacao Spring Boot...
call mvnw spring-boot:run

echo.
echo ✓ Aplicacao rodando em http://localhost:8080/api
echo ✓ Swagger em http://localhost:8080/api/swagger-ui.html
echo ✓ MailHog em http://localhost:8025
echo ✓ pgAdmin em http://localhost:5050
echo.
pause

