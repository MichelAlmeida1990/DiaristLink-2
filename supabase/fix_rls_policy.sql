-- Script para corrigir a política RLS de INSERT na tabela profiles
-- Execute este script no SQL Editor do Supabase se estiver tendo problemas com RLS

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Criar nova política que permite inserção durante signup
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Alternativa: Se ainda não funcionar, você pode temporariamente permitir inserção para usuários autenticados
-- (menos seguro, mas funciona para desenvolvimento)
-- DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
-- CREATE POLICY "Users can insert their own profile" ON profiles
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

