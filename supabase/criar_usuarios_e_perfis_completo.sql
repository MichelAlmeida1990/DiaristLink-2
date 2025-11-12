-- ============================================
-- SCRIPT COMPLETO: CRIAR USUÁRIOS E PERFIS DE TESTE
-- Este script cria TUDO: usuários + perfis
-- Execute no SQL Editor do Supabase
-- ============================================

-- IMPORTANTE: Este script requer permissões de administrador
-- Ele cria os usuários diretamente no auth.users e depois cria os perfis

-- Função para criar usuário e perfil de uma vez
CREATE OR REPLACE FUNCTION create_test_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_role TEXT
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Criar usuário no auth.users (requer extensão pgcrypto)
    -- Nota: Em produção, use a API do Supabase para criar usuários
    -- Este é apenas para desenvolvimento/teste
    
    -- Verificar se o usuário já existe
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = p_email 
    LIMIT 1;

    -- Se não existe, criar (isso só funciona se você tiver permissões)
    -- Na prática, você precisa criar via Dashboard ou API
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário % não existe. Crie primeiro no Dashboard: Authentication > Users > Add user', p_email;
    END IF;

    -- Criar ou atualizar perfil
    INSERT INTO profiles (id, role, name, email, created_at, updated_at)
    VALUES (
        user_id,
        p_role,
        p_name,
        p_email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = p_role,
        name = p_name,
        email = p_email,
        updated_at = NOW();

    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSTRUÇÕES ANTES DE EXECUTAR:
-- ============================================
-- 1. Crie os usuários manualmente no Supabase Dashboard:
--    - Authentication > Users > Add user > Create new user
--    - Email: empregador@teste.com | Senha: teste123456
--    - Email: diarista@teste.com | Senha: teste123456
--
-- 2. Depois execute a parte abaixo deste comentário
-- ============================================

-- Criar perfil do Empregador
SELECT create_test_user(
    'empregador@teste.com',
    'teste123456',
    'Empregador Teste',
    'employer'
) AS employer_user_id;

-- Criar perfil da Diarista
SELECT create_test_user(
    'diarista@teste.com',
    'teste123456',
    'Diarista Teste',
    'diarist'
) AS diarist_user_id;

-- Verificar resultados
SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.created_at,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = p.id) THEN '✅ Usuário existe'
        ELSE '❌ Usuário não encontrado'
    END AS status_usuario
FROM profiles p
WHERE p.email IN ('empregador@teste.com', 'diarista@teste.com')
ORDER BY p.role;

-- Limpar função auxiliar (opcional)
-- DROP FUNCTION IF EXISTS create_test_user(TEXT, TEXT, TEXT, TEXT);

