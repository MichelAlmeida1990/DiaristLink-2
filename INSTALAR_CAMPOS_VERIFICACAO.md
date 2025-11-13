# 📋 Instruções: Adicionar Campos de Verificação para Diaristas

## Passo 1: Executar Scripts SQL no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute os scripts na seguinte ordem:
   - `supabase/add_diarist_verification_fields.sql` (campos básicos)
   - `supabase/create_references_table.sql` (tabelas de referências e certificados)

Este script adiciona os seguintes campos na tabela `profiles`:

- `address` - Endereço completo
- `city` - Cidade
- `state` - Estado
- `zip_code` - CEP
- `cpf` - CPF da diarista
- `criminal_record_check` - Checkbox de declaração de antecedentes
- `criminal_record_url` - URL do documento de antecedentes criminais
- `id_document_url` - URL do documento de identidade
- `proof_of_address_url` - URL do comprovante de endereço
- `is_verified` - Status de verificação (boolean)
- `verification_status` - Status detalhado (pending, approved, rejected)
- `verification_notes` - Notas da verificação
- `has_insurance` - Possui seguro de responsabilidade civil
- `insurance_policy_url` - URL da apólice do seguro
- `background_check_status` - Status do background check (pending, approved, rejected)
- `background_check_provider` - Provedor do background check (Serasa, Quod, Checkr, etc.)
- `background_check_date` - Data do background check

**Novas Tabelas:**
- `professional_references` - Referências profissionais das diaristas
- `certificates` - Certificados e cursos das diaristas

## Passo 2: Criar Bucket de Storage no Supabase

1. Vá em **Storage** no Supabase Dashboard
2. Crie um novo bucket chamado `documents`
3. Configure as políticas de acesso:
   - **Public**: Não (privado)
   - **File size limit**: 10MB (ou conforme necessário)
   - **Allowed MIME types**: image/*, application/pdf

## Passo 3: Configurar Políticas RLS do Storage

Execute este SQL no SQL Editor:

```sql
-- Permitir que usuários autenticados façam upload de seus próprios documentos
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários vejam seus próprios documentos
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Passo 4: Atualizar Políticas RLS da Tabela Profiles

Execute este SQL para permitir que diaristas atualizem seus campos de verificação:

```sql
-- Permitir que diaristas atualizem seus próprios campos de verificação
DROP POLICY IF EXISTS "Diarists can update verification fields" ON profiles;
CREATE POLICY "Diarists can update verification fields" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND role = 'diarist')
  WITH CHECK (auth.uid() = id AND role = 'diarist');
```

## ✅ Verificação

Após executar os scripts:

1. ✅ Campos adicionados na tabela `profiles`
2. ✅ Bucket `documents` criado no Storage
3. ✅ Políticas RLS configuradas
4. ✅ Formulário de cadastro atualizado
5. ✅ Página de verificação criada (`/dashboard/diarist/verification`)

## 📝 Notas Importantes

- **Antecedente Criminal**: Campo obrigatório para diaristas. Eles devem declarar e enviar o documento.
- **Verificação Manual**: Por enquanto, a verificação precisa ser feita manualmente por um administrador.
- **Segurança**: Os documentos são armazenados de forma privada no Supabase Storage.
- **Próximos Passos**: Criar painel administrativo para aprovar/rejeitar verificações.

