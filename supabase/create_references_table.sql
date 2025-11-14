-- Criar tabela de referências profissionais
CREATE TABLE IF NOT EXISTS professional_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diarist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT NOT NULL, -- 'former_employer', 'client', 'colleague'
  years_known INTEGER,
  can_contact BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de certificados
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diarist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT NOT NULL,
  certificate_type TEXT CHECK (certificate_type IN ('cleaning', 'hygiene', 'safety', 'first_aid', 'other')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_references_diarist ON professional_references(diarist_id);
CREATE INDEX IF NOT EXISTS idx_certificates_diarist ON certificates(diarist_id);

-- Habilitar RLS
ALTER TABLE professional_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para referências
CREATE POLICY "Diarists can manage their own references" ON professional_references
  FOR ALL
  TO authenticated
  USING (auth.uid() = diarist_id)
  WITH CHECK (auth.uid() = diarist_id);

-- Políticas RLS para certificados
CREATE POLICY "Diarists can manage their own certificates" ON certificates
  FOR ALL
  TO authenticated
  USING (auth.uid() = diarist_id)
  WITH CHECK (auth.uid() = diarist_id);

-- Política para empregadores visualizarem referências e certificados de diaristas verificadas
CREATE POLICY "Employers can view verified diarist references" ON professional_references
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = professional_references.diarist_id
      AND p.is_verified = TRUE
      AND p.role = 'diarist'
    )
  );

CREATE POLICY "Employers can view verified diarist certificates" ON certificates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = certificates.diarist_id
      AND p.is_verified = TRUE
      AND p.role = 'diarist'
    )
  );




