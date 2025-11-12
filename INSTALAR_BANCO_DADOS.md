# 🗄️ Instalar Banco de Dados no Supabase

Este guia mostra como criar as tabelas necessárias no Supabase.

## 📋 Passo a Passo

### 1. Acesse o SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"** (ícone de código)

### 2. Execute o Script SQL

1. Clique em **"New query"** (Nova consulta)
2. Abra o arquivo `supabase/schema.sql` deste projeto
3. Copie TODO o conteúdo do arquivo
4. Cole no SQL Editor do Supabase
5. Clique em **"Run"** (ou pressione Ctrl+Enter)

### 3. Verificar se Funcionou

1. Vá em **"Table Editor"** no menu lateral
2. Você deve ver as seguintes tabelas:
   - ✅ `profiles`
   - ✅ `jobs`
   - ✅ `messages`
   - ✅ `ratings`

### 4. Configurar Autenticação (Importante!)

Siga o guia em `CONFIGURAR_SUPABASE_AUTH.md` para:
- Desabilitar confirmação de email (para desenvolvimento)
- Configurar URLs de redirecionamento

## ✅ Após Instalar

- ✅ Tabelas criadas com Row Level Security (RLS)
- ✅ Políticas de segurança configuradas
- ✅ Pronto para usar autenticação e criar perfis

## 🐛 Troubleshooting

### Erro: "relation already exists"
- Significa que as tabelas já existem
- Você pode ignorar ou executar apenas as partes que faltam

### Erro: "permission denied"
- Certifique-se de estar logado no Supabase
- Verifique se você tem permissão de administrador no projeto

### Erro ao criar perfil após signup
- Verifique se a tabela `profiles` foi criada
- Verifique se as políticas RLS estão ativas
- Verifique se o código está criando o perfil corretamente após signup

---

**Próximo passo:** Configure a autenticação seguindo `CONFIGURAR_SUPABASE_AUTH.md`

