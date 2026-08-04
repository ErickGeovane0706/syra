@echo off
REM ============================================
REM TESTE AUTOMÁTICO DA API SYRA
REM ============================================

echo.
echo ============================================
echo TESTE AUTOMÁTICO DA API SYRA
echo ============================================
echo.

echo [1/14] Verificando se API está respondendo...
curl -X GET http://localhost:8080/api/usuarios --connect-timeout 5 -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [2/14] Criando Admin Erick...
curl -X POST http://localhost:8080/api/usuarios/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Admin Erick\",\"email\":\"admin1@exemplo.com\",\"senha\":\"admin123\",\"cpf\":\"11111111111\",\"role\":\"ADMIN\",\"telefone\":\"11987654321\"}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [3/14] Criando Admin Exemplo...
curl -X POST http://localhost:8080/api/usuarios/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Admin Exemplo\",\"email\":\"admin2@exemplo.com\",\"senha\":\"admin123\",\"cpf\":\"22222222222\",\"role\":\"ADMIN\",\"telefone\":\"11912345678\"}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [4/14] Criando Cliente Teste...
curl -X POST http://localhost:8080/api/usuarios/register ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Cliente Teste\",\"email\":\"cliente@teste.com\",\"senha\":\"cliente123\",\"cpf\":\"33333333333\",\"role\":\"CLIENTE\",\"telefone\":\"11999999999\"}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [5/14] Listando usuários...
curl -X GET http://localhost:8080/api/usuarios -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [6/14] Criando Serviço 1...
curl -X POST http://localhost:8080/api/servicos ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Consulta Médica\",\"descricao\":\"Consulta clínica geral\",\"duracaoMinutos\":30,\"preco\":150.00}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [7/14] Criando Serviço 2...
curl -X POST http://localhost:8080/api/servicos ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Exame de Sangue\",\"descricao\":\"Exames laboratoriais\",\"duracaoMinutos\":15,\"preco\":80.00}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [8/14] Listando serviços...
curl -X GET http://localhost:8080/api/servicos -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [9/14] Criando horário segunda-feira...
curl -X POST http://localhost:8080/api/horarios ^
  -H "Content-Type: application/json" ^
  -d "{\"diaDaSemana\":\"MONDAY\",\"horaAbertura\":\"09:00\",\"horaFechamento\":\"17:00\",\"trabalhaNesseDia\":true}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [10/14] Criando horário terça-feira...
curl -X POST http://localhost:8080/api/horarios ^
  -H "Content-Type: application/json" ^
  -d "{\"diaDaSemana\":\"TUESDAY\",\"horaAbertura\":\"08:00\",\"horaFechamento\":\"16:00\",\"trabalhaNesseDia\":true}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [11/14] Listando horários...
curl -X GET http://localhost:8080/api/horarios -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [12/14] Criando agendamento...
curl -X POST http://localhost:8080/api/agendamentos ^
  -H "Content-Type: application/json" ^
  -d "{\"usuarioId\":3,\"servicoId\":1,\"dataHoraInicio\":\"2026-03-09T10:00:00\"}" ^
  -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [13/14] Listando agendamentos...
curl -X GET http://localhost:8080/api/agendamentos -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo [14/14] Confirmando agendamento...
curl -X PATCH http://localhost:8080/api/agendamentos/1/confirmar -s -w "Status: %%{http_code}\n" | findstr "Status"
echo.

echo.
echo ============================================
echo RESUMO DOS TESTES
echo ============================================
echo.
echo Se todos os status foram 200/201, a API está funcionando perfeitamente!
echo.
echo Usuários admin criados:
echo - admin1@exemplo.com
echo - admin2@exemplo.com
echo.
echo Para verificar os dados:
echo - PgAdmin: http://localhost:5050
echo - Swagger: http://localhost:8080/swagger-ui.html
echo - MailHog: http://localhost:8025
echo.
pause
