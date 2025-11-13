-- ============================================
-- CORRIGIR POLÍTICA RLS PARA DIARISTAS VEREM JOBS DISPONÍVEIS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Remover política antiga se existir
DROP POLICY IF EXISTS "Diarists can view available jobs" ON jobs;

-- 2. Criar política para diaristas visualizarem jobs disponíveis (pending)
CREATE POLICY "Diarists can view available jobs" ON jobs
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'diarist'
    )
  );

-- 3. Verificar se a política foi criada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'jobs'
ORDER BY policyname;

-- 4. Testar a política (substitua 'SEU_UUID_DA_DIARISTA' pelo UUID real)
-- SELECT 
--   j.*,
--   p.role as user_role
-- FROM jobs j
-- CROSS JOIN profiles p
-- WHERE p.role = 'diarist'
-- AND j.status = 'pending'
-- LIMIT 5;

