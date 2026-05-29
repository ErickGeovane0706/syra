-- =====================================================
-- SCRIPT PARA LIMPAR TODAS AS TABELAS DO BANCO SYRA
-- =====================================================
-- Este script remove todos os dados das tabelas
-- mantendo a estrutura (tabelas, colunas, índices)
-- =====================================================

-- Desabilitar verificação de chaves estrangeiras temporariamente
SET session_replication_role = 'replica';

-- Limpar tabelas na ordem correta (respeitando dependências)
TRUNCATE TABLE agendamentos CASCADE;
TRUNCATE TABLE horarios_atendimento CASCADE;
TRUNCATE TABLE servicos CASCADE;
TRUNCATE TABLE usuarios CASCADE;

-- Reabilitar verificação de chaves estrangeiras
SET session_replication_role = 'origin';

-- Resetar sequences (auto-increment) para começar do 1 novamente
ALTER SEQUENCE agendamentos_id_seq RESTART WITH 1;
ALTER SEQUENCE horarios_atendimento_id_seq RESTART WITH 1;
ALTER SEQUENCE servicos_id_seq RESTART WITH 1;
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;

-- Verificar se as tabelas estão vazias
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'servicos' as tabela, COUNT(*) as total FROM servicos
UNION ALL
SELECT 'horarios_atendimento' as tabela, COUNT(*) as total FROM horarios_atendimento
UNION ALL
SELECT 'agendamentos' as tabela, COUNT(*) as total FROM agendamentos;

-- =====================================================
-- Mensagem de sucesso
-- =====================================================
SELECT '✅ Banco de dados limpo com sucesso!' as status;

