-- Script SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('employer', 'diarist')) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES profiles(id) NOT NULL,
  diarist_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price DECIMAL(10, 2) NOT NULL,
  duration_hours DECIMAL(4, 2) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  rater_id UUID REFERENCES profiles(id) NOT NULL,
  rated_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (se ainda não estiver habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Adicionar colunas de latitude e longitude na tabela profiles (se ainda não existirem)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para jobs
DROP POLICY IF EXISTS "Users can view jobs they're involved in" ON jobs;
CREATE POLICY "Users can view jobs they're involved in" ON jobs
  FOR SELECT USING (auth.uid() = employer_id OR auth.uid() = diarist_id);

DROP POLICY IF EXISTS "Employers can create jobs" ON jobs;
CREATE POLICY "Employers can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Users can update jobs they're involved in" ON jobs;
CREATE POLICY "Users can update jobs they're involved in" ON jobs
  FOR UPDATE USING (auth.uid() = employer_id OR auth.uid() = diarist_id);

-- Políticas RLS para messages
DROP POLICY IF EXISTS "Users can view messages for their jobs" ON messages;
CREATE POLICY "Users can view messages for their jobs" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages for their jobs" ON messages;
CREATE POLICY "Users can send messages for their jobs" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

-- Políticas RLS para ratings
DROP POLICY IF EXISTS "Users can view ratings for their jobs" ON ratings;
CREATE POLICY "Users can view ratings for their jobs" ON ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = ratings.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create ratings for their jobs" ON ratings;
CREATE POLICY "Users can create ratings for their jobs" ON ratings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = ratings.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Esta função será chamada manualmente no código, não via trigger
  -- para permitir que o usuário escolha o role
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

