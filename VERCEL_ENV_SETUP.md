# Configuração de Variáveis de Ambiente no Vercel

Este guia mostra como configurar as variáveis de ambiente necessárias para o deploy na Vercel.

## Variáveis de Ambiente Necessárias

O projeto precisa das seguintes variáveis de ambiente:

### 1. Variáveis Públicas (NEXT_PUBLIC_*)
Essas variáveis são expostas ao cliente e podem ser acessadas no navegador:

- `NEXT_PUBLIC_SUPABASE_URL` - URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave pública/anônima do Supabase

### 2. Variáveis Privadas (Server-side)
Essas variáveis são apenas para o servidor:

- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase (opcional, usado para criar perfis)

## Como Configurar no Vercel

### Método 1: Via Dashboard da Vercel (Recomendado)

1. **Acesse o Dashboard da Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Faça login na sua conta

2. **Selecione seu Projeto**
   - Clique no projeto "DiaristLink-2" (ou o nome que você deu)

3. **Vá para Settings**
   - Clique na aba **Settings** no topo

4. **Acesse Environment Variables**
   - No menu lateral, clique em **Environment Variables**

5. **Adicione as Variáveis**

   **Para Production:**
   - Clique em **Add New**
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Cole a URL do seu projeto Supabase (exemplo: `https://xxxxx.supabase.co`)
   - **Environment**: Selecione `Production`
   - Clique em **Save**

   Repita para:
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Cole a chave anônima do Supabase
   - **Environment**: `Production`

   - **Key**: `SUPABASE_SERVICE_ROLE_KEY` (opcional)
   - **Value**: Cole a chave de serviço do Supabase
   - **Environment**: `Production`

   **Para Preview e Development:**
   - Você pode adicionar as mesmas variáveis para `Preview` e `Development` também
   - Ou deixar apenas em `Production` se preferir

6. **Redeploy**
   - Após adicionar as variáveis, vá para a aba **Deployments**
   - Clique nos três pontos (...) do último deployment
   - Selecione **Redeploy**
   - Ou faça um novo commit/push para triggerar um novo deploy

### Método 2: Via CLI da Vercel

Se você tem a CLI instalada:

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Fazer login
vercel login

# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Para preview e development também (opcional)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview

vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
vercel env add SUPABASE_SERVICE_ROLE_KEY development
```

## Onde Encontrar as Credenciais do Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login e selecione seu projeto

2. **Vá para Settings**
   - Clique em **Settings** (ícone de engrenagem) no menu lateral

3. **Acesse API**
   - Clique em **API** no submenu

4. **Encontre as Credenciais**
   - **Project URL**: Esta é a `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: Esta é a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: Esta é a `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **MANTENHA SECRETA!**)

## Verificação

Após configurar as variáveis e fazer o redeploy:

1. Acesse sua aplicação no Vercel
2. Tente fazer login/cadastro
3. Verifique o console do navegador (F12) para erros
4. Se houver erros relacionados ao Supabase, verifique se as variáveis foram configuradas corretamente

## Importante ⚠️

- **Nunca** commite arquivos `.env` ou `.env.local` no Git
- A `SUPABASE_SERVICE_ROLE_KEY` é muito sensível - nunca exponha no cliente
- As variáveis `NEXT_PUBLIC_*` são públicas e podem ser vistas no código do cliente
- Sempre faça redeploy após adicionar/modificar variáveis de ambiente

## Troubleshooting

### Erro: "Missing environment variable"
- Verifique se o nome da variável está correto (case-sensitive)
- Certifique-se de que selecionou o ambiente correto (Production/Preview/Development)
- Faça um redeploy após adicionar as variáveis

### Erro de autenticação Supabase
- Verifique se a URL e as chaves estão corretas
- Certifique-se de que copiou as chaves completas (sem espaços extras)
- Verifique se o projeto Supabase está ativo

### Variáveis não aparecem no build
- As variáveis são injetadas no momento do build
- Você precisa fazer um novo deploy após adicionar variáveis
- Variáveis adicionadas após o build não estarão disponíveis até o próximo deploy

