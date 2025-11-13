-- Adicionar política para diaristas visualizarem jobs disponíveis (pending)
-- Execute este script no SQL Editor do Supabase

DROP POLICY IF EXISTS "Diarists can view available jobs" ON jobs;
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

-- Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'jobs'
ORDER BY policyname;

