-- Adicionar campos de verificação para diaristas
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas de verificação na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS criminal_record_check BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS criminal_record_url TEXT,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS proof_of_address_url TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
-- Campos adicionais de segurança
ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS insurance_policy_url TEXT,
ADD COLUMN IF NOT EXISTS background_check_status TEXT CHECK (background_check_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS background_check_provider TEXT,
ADD COLUMN IF NOT EXISTS background_check_date TIMESTAMP WITH TIME ZONE;

-- Criar índice para busca por cidade/estado
CREATE INDEX IF NOT EXISTS idx_profiles_city_state ON profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status) WHERE role = 'diarist';

-- Comentários nas colunas
COMMENT ON COLUMN profiles.address IS 'Endereço completo do usuário';
COMMENT ON COLUMN profiles.criminal_record_check IS 'Verificação de antecedentes criminais';
COMMENT ON COLUMN profiles.criminal_record_url IS 'URL do documento de antecedentes criminais';
COMMENT ON COLUMN profiles.id_document_url IS 'URL do documento de identidade (RG/CPF)';
COMMENT ON COLUMN profiles.proof_of_address_url IS 'URL do comprovante de endereço';
COMMENT ON COLUMN profiles.is_verified IS 'Diarista verificada e aprovada';
COMMENT ON COLUMN profiles.verification_status IS 'Status da verificação: pending, approved, rejected';

