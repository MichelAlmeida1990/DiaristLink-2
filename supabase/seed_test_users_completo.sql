-- ============================================
-- SCRIPT COMPLETO PARA CRIAR USUÁRIOS DE TESTE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Criar os usuários no Supabase Auth primeiro
-- Você precisa criar manualmente no Dashboard:
-- 1. Vá em Authentication > Users
-- 2. Clique em "Add user" > "Create new user"
-- 3. Crie:
--    - Email: empregador@teste.com | Senha: teste123456
--    - Email: diarista@teste.com | Senha: teste123456
-- 4. Depois execute este script SQL

-- PASSO 2: Buscar os UUIDs dos usuários criados
-- Execute esta query para encontrar os UUIDs:
DO $$
DECLARE
    employer_uuid UUID;
    diarist_uuid UUID;
BEGIN
    -- Buscar UUID do empregador
    SELECT id INTO employer_uuid 
    FROM auth.users 
    WHERE email = 'empregador@teste.com' 
    LIMIT 1;

    -- Buscar UUID da diarista
    SELECT id INTO diarist_uuid 
    FROM auth.users 
    WHERE email = 'diarista@teste.com' 
    LIMIT 1;

    -- Criar perfil do Empregador
    IF employer_uuid IS NOT NULL THEN
        INSERT INTO profiles (id, role, name, email, created_at, updated_at)
        VALUES (
            employer_uuid,
            'employer',
            'Empregador Teste',
            'empregador@teste.com',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'employer',
            name = 'Empregador Teste',
            email = 'empregador@teste.com',
            updated_at = NOW();
        
        RAISE NOTICE 'Perfil do empregador criado/atualizado: %', employer_uuid;
    ELSE
        RAISE WARNING 'Usuário empregador@teste.com não encontrado! Crie o usuário primeiro no Supabase Auth.';
    END IF;

    -- Criar perfil da Diarista
    IF diarist_uuid IS NOT NULL THEN
        INSERT INTO profiles (id, role, name, email, created_at, updated_at)
        VALUES (
            diarist_uuid,
            'diarist',
            'Diarista Teste',
            'diarista@teste.com',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'diarist',
            name = 'Diarista Teste',
            email = 'diarista@teste.com',
            updated_at = NOW();
        
        RAISE NOTICE 'Perfil da diarista criado/atualizado: %', diarist_uuid;
    ELSE
        RAISE WARNING 'Usuário diarista@teste.com não encontrado! Crie o usuário primeiro no Supabase Auth.';
    END IF;

    -- Mostrar resumo
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREDENCIAIS DE TESTE:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Empregador:';
    RAISE NOTICE '  Email: empregador@teste.com';
    RAISE NOTICE '  Senha: teste123456';
    RAISE NOTICE '';
    RAISE NOTICE 'Diarista:';
    RAISE NOTICE '  Email: diarista@teste.com';
    RAISE NOTICE '  Senha: teste123456';
    RAISE NOTICE '========================================';
END $$;

-- Verificar se os perfis foram criados
SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.created_at
FROM profiles p
WHERE p.email IN ('empregador@teste.com', 'diarista@teste.com')
ORDER BY p.role;

