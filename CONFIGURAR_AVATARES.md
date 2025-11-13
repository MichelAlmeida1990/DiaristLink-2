# 📸 Configurar Upload de Avatares

## Passo 1: Criar Bucket de Storage no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **Storage**
3. Clique em **New bucket**
4. Configure:
   - **Name**: `avatars`
   - **Public bucket**: Sim (para que as imagens sejam acessíveis publicamente)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

## Passo 2: Configurar Políticas RLS do Storage

Execute este SQL no SQL Editor do Supabase:

```sql
-- Permitir que usuários autenticados façam upload de seus próprios avatares
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir que todos vejam avatares (bucket público)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Passo 3: Verificar

Após configurar:
1. ✅ Bucket `avatars` criado
2. ✅ Políticas RLS configuradas
3. ✅ Upload de foto funcionando na página de perfil
4. ✅ Fotos aparecendo nos mapas

