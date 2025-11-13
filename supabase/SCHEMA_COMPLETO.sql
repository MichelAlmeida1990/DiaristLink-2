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

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS proof_of_address_url TEXT,
ADD COLUMN IF NOT EXISTS criminal_record_check BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS criminal_record_url TEXT,
ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS insurance_policy_url TEXT,
ADD COLUMN IF NOT EXISTS background_check_status TEXT CHECK (background_check_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS background_check_provider TEXT,
ADD COLUMN IF NOT EXISTS background_check_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

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

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  rater_id UUID REFERENCES profiles(id) NOT NULL,
  rated_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Diarists can update verification fields" ON profiles;
CREATE POLICY "Diarists can update verification fields" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND role = 'diarist')
  WITH CHECK (auth.uid() = id AND role = 'diarist');

DROP POLICY IF EXISTS "Users can view jobs they're involved in" ON jobs;
CREATE POLICY "Users can view jobs they're involved in" ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = diarist_id);

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

DROP POLICY IF EXISTS "Employers can create jobs" ON jobs;
CREATE POLICY "Employers can create jobs" ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "Users can update jobs they're involved in" ON jobs;
CREATE POLICY "Users can update jobs they're involved in" ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = diarist_id);

DROP POLICY IF EXISTS "Users can view messages from their jobs" ON messages;
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

DROP POLICY IF EXISTS "Users can send messages in their jobs" ON messages;
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

DROP POLICY IF EXISTS "Users can view ratings from their jobs" ON ratings;
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

DROP POLICY IF EXISTS "Users can create ratings in their jobs" ON ratings;
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

DROP POLICY IF EXISTS "Diarists can manage their own references" ON professional_references;
CREATE POLICY "Diarists can manage their own references" ON professional_references
  FOR ALL
  TO authenticated
  USING (auth.uid() = diarist_id)
  WITH CHECK (auth.uid() = diarist_id);

DROP POLICY IF EXISTS "Employers can view verified diarist references" ON professional_references;
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

DROP POLICY IF EXISTS "Diarists can manage their own certificates" ON certificates;
CREATE POLICY "Diarists can manage their own certificates" ON certificates
  FOR ALL
  TO authenticated
  USING (auth.uid() = diarist_id)
  WITH CHECK (auth.uid() = diarist_id);

DROP POLICY IF EXISTS "Employers can view verified diarist certificates" ON certificates;
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

CREATE OR REPLACE FUNCTION check_single_active_job()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.diarist_id IS NOT NULL AND NEW.status IN ('accepted', 'in_progress') THEN
    IF EXISTS (
      SELECT 1 FROM jobs
      WHERE diarist_id = NEW.diarist_id
      AND status IN ('accepted', 'in_progress')
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Uma diarista só pode ter um job ativo por vez. Finalize ou cancele o job atual antes de aceitar outro.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_single_active_job ON jobs;
CREATE TRIGGER trigger_check_single_active_job
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION check_single_active_job();

CREATE INDEX IF NOT EXISTS idx_profiles_city_state ON profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status) WHERE role = 'diarist';
CREATE INDEX IF NOT EXISTS idx_references_diarist ON professional_references(diarist_id);
CREATE INDEX IF NOT EXISTS idx_certificates_diarist ON certificates(diarist_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_diarist ON jobs(diarist_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_diarist_status ON jobs(diarist_id, status) WHERE status IN ('accepted', 'in_progress');
