# 🚀 Guia de Setup - DiaristaLink

Este guia irá te ajudar a configurar o projeto DiaristaLink do zero.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn** (vem com Node.js)
- **Git** ([Download](https://git-scm.com/))
- Conta no **Supabase** ([Criar conta gratuita](https://supabase.com/)) - Plano gratuito disponível
- Conta no **Stripe** ([Criar conta](https://stripe.com/)) - Opcional, apenas se for usar pagamentos (tem plano gratuito para desenvolvimento)
- **Nenhuma API key necessária** para mapas ou geocoding! Usamos ferramentas 100% gratuitas (React-Leaflet + OpenStreetMap)

## 🏗️ Passo a Passo

### 1. Clone o Repositório

```bash
git clone <seu-repositorio>
cd diaristLink
```

### 2. Instale as Dependências

```bash
npm install
```

ou

```bash
yarn install
```

### 3. Configure o Supabase

1. Acesse [Supabase](https://supabase.com/) e crie um novo projeto
2. Vá em **Settings** > **API**
3. Copie a **URL** e a **anon key**
4. Vá em **Settings** > **Database** > **Connection string** > **URI** para obter a connection string (opcional)

### 4. Configure as Variáveis de Ambiente

1. Copie o arquivo `env.example` para `.env.local`:

```bash
cp env.example .env.local
```

2. Abra o arquivo `.env.local` e preencha com suas credenciais:

```env
# Supabase (OBRIGATÓRIO - Plano gratuito disponível)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Stripe (OPCIONAL - Apenas se for usar pagamentos)
# Tem plano gratuito para desenvolvimento/testes
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NOTA IMPORTANTE: 
# - Mapas usam React-Leaflet com OpenStreetMap (100% gratuito, sem API key)
# - Geocoding usa Nominatim (OpenStreetMap) - 100% gratuito, sem API key
# - Não é necessária nenhuma configuração adicional para mapas!
```

### 5. Configure o Banco de Dados no Supabase

Execute os seguintes comandos SQL no **SQL Editor** do Supabase:

```sql
-- Criar tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('employer', 'diarist')) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de jobs
CREATE TABLE jobs (
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
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de avaliações
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  rater_id UUID REFERENCES profiles(id) NOT NULL,
  rated_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para jobs
CREATE POLICY "Users can view jobs they're involved in" ON jobs
  FOR SELECT USING (auth.uid() = employer_id OR auth.uid() = diarist_id);

CREATE POLICY "Employers can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Users can update jobs they're involved in" ON jobs
  FOR UPDATE USING (auth.uid() = employer_id OR auth.uid() = diarist_id);

-- Políticas RLS para messages
CREATE POLICY "Users can view messages for their jobs" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages for their jobs" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = messages.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

-- Políticas RLS para ratings
CREATE POLICY "Users can view ratings for their jobs" ON ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = ratings.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );

CREATE POLICY "Users can create ratings for their jobs" ON ratings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = ratings.job_id
      AND (jobs.employer_id = auth.uid() OR jobs.diarist_id = auth.uid())
    )
  );
```

### 6. Execute o Servidor de Desenvolvimento

```bash
npm run dev
```

ou

```bash
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## ✅ Verificação

Se tudo estiver configurado corretamente, você deve ver:

- ✅ Landing page carregando sem erros
- ✅ Navegação funcionando
- ✅ Páginas de login e signup acessíveis
- ✅ Sem erros no console do navegador
- ✅ Sem erros no terminal

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

**Solução**: Certifique-se de que o arquivo `.env.local` existe e contém as variáveis corretas.

### Erro: "Module not found"

**Solução**: Execute `npm install` novamente para garantir que todas as dependências estão instaladas.

### Erro: "Port 3000 already in use"

**Solução**: Use outra porta:

```bash
PORT=3001 npm run dev
```

### Erro no build

**Solução**: Limpe o cache e reinstale:

```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 📚 Próximos Passos

Após o setup inicial estar funcionando:

1. **Fase 2**: Implementar autenticação completa com Supabase
2. **Fase 3**: Adicionar mapa interativo com React-Leaflet/Mapbox
3. **Fase 4**: Implementar sistema de matching baseado em GPS
4. **Fase 5**: Adicionar chat em tempo real
5. **Fase 6**: Integrar pagamentos com Stripe

## 🆘 Precisa de Ajuda?

- Consulte o [README.md](./README.md) para mais informações
- Abra uma issue no repositório
- Verifique a documentação do [Next.js](https://nextjs.org/docs)
- Verifique a documentação do [Supabase](https://supabase.com/docs)

---

**Boa sorte com o desenvolvimento! 🚀**

