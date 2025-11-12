# 🔐 Configurar Autenticação no Supabase (Sem Confirmação de Email)

Para que o login funcione sem precisar confirmar email (ideal para desenvolvimento), siga estes passos:

## 📋 Passo a Passo

### 1. Acesse o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **diaristlink** (ou o nome que você deu)

### 2. Desabilitar Confirmação de Email

1. No menu lateral esquerdo, clique em **"Authentication"** (ícone de cadeado)
2. Clique em **"Settings"** (Configurações)
3. Role a página até encontrar **"Email Auth"**
4. Procure a opção **"Enable email confirmations"**
5. **DESMARQUE** essa opção (deixe desabilitada)
6. Clique em **"Save"** (Salvar)

### 3. Configurar URLs de Redirecionamento

1. Ainda em **Authentication** > **Settings**
2. Role até **"URL Configuration"**
3. Em **"Site URL"**, adicione:
   ```
   http://localhost:3001
   ```
4. Em **"Redirect URLs"**, adicione:
   ```
   http://localhost:3001/**
   ```
5. Clique em **"Save"**

### 4. Verificar Configurações de Email (Opcional)

1. Em **Authentication** > **Settings**
2. Role até **"SMTP Settings"** (opcional para desenvolvimento)
3. Para desenvolvimento local, você pode deixar as configurações padrão

### 5. Testar

1. Volte para o app: `http://localhost:3001`
2. Tente criar uma nova conta
3. Agora você deve conseguir fazer login imediatamente sem precisar confirmar email!

---

## ✅ Após Configurar

- ✅ Login funcionará imediatamente após signup
- ✅ Não precisará confirmar email
- ✅ Ideal para desenvolvimento e testes

---

## ⚠️ Importante

- Esta configuração é ideal para **desenvolvimento**
- Para **produção**, você deve habilitar a confirmação de email novamente
- Isso garante que apenas emails válidos sejam usados

