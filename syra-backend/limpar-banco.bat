@echo off
chcp 65001 > nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        🗑️  LIMPEZA DO BANCO DE DADOS SYRA                 ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ⚠️  ATENÇÃO: Este script irá APAGAR TODOS OS DADOS do banco!
echo.
echo    Tabelas que serão limpas:
echo    - usuarios
echo    - servicos
echo    - horarios_atendimento
echo    - agendamentos
echo.
set /p confirm="Deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo.
    echo ❌ Operação cancelada.
    timeout /t 3 > nul
    exit /b
)

echo.
echo 🔄 Limpando banco de dados...
echo.

docker exec -i syra-db psql -U admin -d syra_db < limpar-banco.sql

if %errorlevel% equ 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║                                                            ║
    echo ║        ✅ BANCO DE DADOS LIMPO COM SUCESSO!               ║
    echo ║                                                            ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo 📊 Agora você pode:
    echo    1. Executar o teste-syra.bat para popular o banco
    echo    2. Usar o sistema normalmente
    echo.
) else (
    echo.
    echo ❌ Erro ao limpar banco de dados!
    echo.
    echo Possíveis causas:
    echo - Docker não está rodando
    echo - Container syra-db não está ativo
    echo.
    echo Solução:
    echo    docker-compose up -d
    echo.
)

pause

