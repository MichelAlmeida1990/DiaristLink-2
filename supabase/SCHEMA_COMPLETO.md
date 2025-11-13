# 📊 Schema Completo do Banco de Dados - DiaristaLink

**Última atualização:** Dezembro 2024  
**Versão:** 1.0

Este documento contém a estrutura completa de todas as tabelas do banco de dados, incluindo todas as alterações e campos adicionados.

---

## 📋 Índice

1. [Tabela: profiles](#tabela-profiles)
2. [Tabela: jobs](#tabela-jobs)
3. [Tabela: messages](#tabela-messages)
4. [Tabela: ratings](#tabela-ratings)
5. [Tabela: professional_references](#tabela-professional_references)
6. [Tabela: certificates](#tabela-certificates)
7. [Políticas RLS](#políticas-rls)
8. [Índices](#índices)

---

## 📌 Tabela: profiles

Tabela principal de perfis de usuários (empregadores e diaristas).

### Estrutura Completa

```sql
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
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  cpf TEXT,
  id_document_url TEXT,
  proof_of_address_url TEXT,
  criminal_record_check BOOLEAN DEFAULT FALSE,
  criminal_record_url TEXT,
  has_insurance BOOLEAN DEFAULT FALSE,
  insurance_policy_url TEXT,
  background_check_status TEXT CHECK (background_check_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  background_check_provider TEXT,
  background_check_date TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos

- `id` - UUID (chave primária, referência a auth.users)
- `role` - TEXT ('employer' ou 'diarist')
- `name` - TEXT (obrigatório)
- `email` - TEXT (obrigatório)
- `phone` - TEXT (opcional)
- `avatar_url` - TEXT (opcional)
- `bio` - TEXT (opcional)
- `latitude` - DECIMAL(10, 8) (coordenada GPS)
- `longitude` - DECIMAL(11, 8) (coordenada GPS)
- `address` - TEXT (endereço completo)
- `city` - TEXT (cidade)
- `state` - TEXT (estado)
- `zip_code` - TEXT (CEP)
- `cpf` - TEXT (CPF do usuário)
- `id_document_url` - TEXT (URL do documento de identidade)
- `proof_of_address_url` - TEXT (URL do comprovante de endereço)
- `criminal_record_check` - BOOLEAN (declaração de não ter antecedentes)
- `criminal_record_url` - TEXT (URL da certidão de antecedentes criminais)
- `has_insurance` - BOOLEAN (possui seguro de responsabilidade civil)
- `insurance_policy_url` - TEXT (URL da apólice do seguro)
- `background_check_status` - TEXT ('pending', 'approved', 'rejected')
- `background_check_provider` - TEXT (provedor do background check)
- `background_check_date` - TIMESTAMP (data do background check)
- `is_verified` - BOOLEAN (diarista verificada e aprovada)
- `verification_status` - TEXT ('pending', 'approved', 'rejected')
- `verification_notes` - TEXT (notas da verificação)
- `created_at` - TIMESTAMP (data de criação)
- `updated_at` - TIMESTAMP (data de atualização)

---

## 📌 Tabela: jobs

Tabela de serviços/jobs criados pelos empregadores.

### Estrutura Completa

```sql
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
```

### Campos

- `id` - UUID (chave primária)
- `employer_id` - UUID (FK para profiles, obrigatório)
- `diarist_id` - UUID (FK para profiles, preenchido quando aceito)
- `title` - TEXT (obrigatório)
- `description` - TEXT (opcional)
- `service_type` - TEXT (obrigatório, ex: "Limpeza Geral", "Cozinha")
- `address` - TEXT (obrigatório)
- `latitude` - DECIMAL(10, 8) (coordenada GPS)
- `longitude` - DECIMAL(11, 8) (coordenada GPS)
- `price` - DECIMAL(10, 2) (obrigatório, valor em R$)
- `duration_hours` - DECIMAL(4, 2) (obrigatório, duração estimada)
- `scheduled_at` - TIMESTAMP (obrigatório, data/hora agendada)
- `status` - TEXT ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP


---

## 📌 Tabela: messages

Tabela de mensagens do chat entre empregador e diarista.

### Estrutura Completa

```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos

- `id` - UUID (chave primária)
- `job_id` - UUID (FK para jobs, obrigatório)
- `sender_id` - UUID (FK para profiles, quem enviou a mensagem)
- `content` - TEXT (obrigatório, texto da mensagem)
- `image_url` - TEXT (opcional, URL da imagem anexada)
- `created_at` - TIMESTAMP (data/hora de envio)

---

## 📌 Tabela: ratings

Tabela de avaliações entre empregadores e diaristas.

### Estrutura Completa

```sql
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  rater_id UUID REFERENCES profiles(id) NOT NULL,
  rated_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos

- `id` - UUID (chave primária)
- `job_id` - UUID (FK para jobs, obrigatório)
- `rater_id` - UUID (FK para profiles, quem avaliou)
- `rated_id` - UUID (FK para profiles, quem foi avaliado)
- `rating` - INTEGER (1 a 5, obrigatório)
- `comment` - TEXT (opcional, comentário da avaliação)
- `created_at` - TIMESTAMP (data da avaliação)

---

## 📌 Tabela: professional_references

Tabela de referências profissionais das diaristas.

### Estrutura Completa

```sql
CREATE TABLE IF NOT EXISTS professional_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diarist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT NOT NULL,
  years_known INTEGER,
  can_contact BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos

- `id` - UUID (chave primária)
- `diarist_id` - UUID (FK para profiles, obrigatório, CASCADE DELETE)
- `name` - TEXT (obrigatório, nome da referência)
- `company` - TEXT (opcional, empresa)
- `position` - TEXT (opcional, cargo)
- `phone` - TEXT (obrigatório, telefone)
- `email` - TEXT (opcional, email)
- `relationship` - TEXT (obrigatório: 'former_employer', 'client', 'colleague')
- `years_known` - INTEGER (opcional, anos conhecido)
- `can_contact` - BOOLEAN (padrão: TRUE, pode entrar em contato)
- `created_at` - TIMESTAMP


---

## 📌 Tabela: certificates

Tabela de certificados e cursos das diaristas.

### Estrutura Completa

```sql
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diarist_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  certificate_type TEXT CHECK (certificate_type IN ('cleaning', 'hygiene', 'safety', 'first_aid', 'other')) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  certificate_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos

- `id` - UUID (chave primária)
- `diarist_id` - UUID (FK para profiles, obrigatório, CASCADE DELETE)
- `name` - TEXT (obrigatório, nome do certificado)
- `issuer` - TEXT (obrigatório, emissor/instituição)
- `certificate_type` - TEXT (obrigatório: 'cleaning', 'hygiene', 'safety', 'first_aid', 'other')
- `issue_date` - DATE (opcional, data de emissão)
- `expiry_date` - DATE (opcional, data de validade)
- `certificate_url` - TEXT (obrigatório, URL do documento)
- `created_at` - TIMESTAMP


---

## 🔒 Políticas RLS (Row Level Security)

### Tabela: profiles

```sql
-- Visualizar próprio perfil
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Atualizar próprio perfil
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserir próprio perfil
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Diaristas podem atualizar campos de verificação
CREATE POLICY "Diarists can update verification fields" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND role = 'diarist')
  WITH CHECK (auth.uid() = id AND role = 'diarist');
```

### Tabela: jobs

```sql
CREATE POLICY "Users can view jobs they're involved in" ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = diarist_id);

CREATE POLICY "Employers can create jobs" ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Users can update jobs they're involved in" ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = diarist_id);
```

### Tabela: messages

```sql
CREATE POLICY "Users can view messages from their jobs" ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their jobs" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );
```

### Tabela: ratings

```sql
CREATE POLICY "Users can view ratings from their jobs" ON ratings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = ratings.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

CREATE POLICY "Users can create ratings in their jobs" ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = ratings.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
    AND rater_id = auth.uid()
  );
```

### Tabela: professional_references

```sql
CREATE POLICY "Diarists can manage their own references" ON professional_references
  FOR ALL
  TO authenticated
  USING (auth.uid() = diarist_id)
  WITH CHECK (auth.uid() = diarist_id);

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
```

### Tabela: certificates

```sql
CREATE POLICY "Diarists can manage their own certificates" ON certificates
  FOR ALL
  TO authenticated
  USING (auth.uid() = diarist_id)
  WITH CHECK (auth.uid() = diarist_id);

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
```

---

## 📊 Índices

### Tabela: profiles

```sql
CREATE INDEX idx_profiles_city_state ON profiles(city, state);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status) WHERE role = 'diarist';
```

### Tabela: professional_references

```sql
CREATE INDEX idx_references_diarist ON professional_references(diarist_id);
```

### Tabela: certificates

```sql
CREATE INDEX idx_certificates_diarist ON certificates(diarist_id);
```

---

## 📝 Histórico de Alterações

### Versão 1.0 (Dezembro 2024)
- Criação inicial das tabelas: profiles, jobs, messages, ratings
- Adição de campos de localização (latitude, longitude) em profiles
- Adição de campos de endereço (address, city, state, zip_code) em profiles
- Adição de campos de verificação para diaristas
- Criação da tabela professional_references
- Criação da tabela certificates
- Configuração de todas as políticas RLS
- Criação de índices para otimização de consultas

