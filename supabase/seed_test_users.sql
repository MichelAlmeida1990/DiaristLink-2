-- ============================================
-- SCRIPT COMPLETO PARA CRIAR PERFIS DE TESTE
-- Execute este script no SQL Editor do Supabase
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Primeiro, crie os usuários no Supabase Dashboard:
--    - Vá em Authentication > Users > Add user > Create new user
--    - Email: empregador@teste.com | Senha: teste123456
--    - Email: diarista@teste.com | Senha: teste123456
--
-- 2. Depois execute este script completo abaixo
-- ============================================

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
        
        RAISE NOTICE '✅ Perfil do empregador criado/atualizado: %', employer_uuid;
    ELSE
        RAISE WARNING '❌ Usuário empregador@teste.com não encontrado! Crie o usuário primeiro no Supabase Auth.';
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
        
        RAISE NOTICE '✅ Perfil da diarista criado/atualizado: %', diarist_uuid;
    ELSE
        RAISE WARNING '❌ Usuário diarista@teste.com não encontrado! Crie o usuário primeiro no Supabase Auth.';
    END IF;

    -- Mostrar resumo
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREDENCIAIS DE TESTE:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📧 Empregador:';
    RAISE NOTICE '   Email: empregador@teste.com';
    RAISE NOTICE '   Senha: teste123456';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Diarista:';
    RAISE NOTICE '   Email: diarista@teste.com';
    RAISE NOTICE '   Senha: teste123456';
    RAISE NOTICE '========================================';
END $$;

-- Verificar se os perfis foram criados com sucesso
SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.created_at,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = p.id) THEN '✅ OK'
        ELSE '❌ Usuário não encontrado'
    END AS status
FROM profiles p
WHERE p.email IN ('empregador@teste.com', 'diarista@teste.com')
ORDER BY p.role;

