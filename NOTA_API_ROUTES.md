# ⚠️ Nota Importante: API Routes e Export Estático

## Problema

O Next.js com `output: 'export'` (export estático) **não suporta API Routes**. Isso significa que todas as rotas em `app/api/` não funcionarão no app mobile.

## Solução

### Opção 1: Chamadas Diretas ao Supabase (Recomendado)

O código já usa Supabase diretamente em muitos lugares. Para o mobile, podemos fazer todas as chamadas diretamente ao Supabase, sem passar pelas API routes.

**Vantagens:**
- ✅ Funciona perfeitamente no mobile
- ✅ Menos latência (sem intermediário)
- ✅ Código mais simples

**Desvantagens:**
- ⚠️ Precisa ajustar algumas rotas que usam `service_role` (como aceitar jobs)

### Opção 2: Backend Separado

Criar um backend separado (Express, FastAPI, etc.) para as operações que precisam de `service_role`.

**Vantagens:**
- ✅ Mantém segurança do `service_role` no servidor
- ✅ Centraliza lógica de negócio

**Desvantagens:**
- ❌ Mais complexo
- ❌ Precisa hospedar backend separado
- ❌ Mais custos

### Opção 3: Usar Supabase Edge Functions

Criar Edge Functions no Supabase para operações que precisam de `service_role`.

**Vantagens:**
- ✅ Mantém segurança
- ✅ Escalável
- ✅ Integrado com Supabase

**Desvantagens:**
- ⚠️ Requer configuração adicional

## Rotas que Precisam de Ajuste

### Rotas que usam `service_role`:
- `/api/jobs/[id]/update-status` - Aceitar jobs (precisa de service_role para contornar RLS)

### Rotas que podem ser substituídas por chamadas diretas:
- `/api/diarists/nearby` - Buscar diaristas próximas
- `/api/jobs/available` - Buscar jobs disponíveis
- `/api/geocode` - Geocoding (pode usar Nominatim direto)
- `/api/cep/[cep]` - Buscar CEP (pode usar ViaCEP direto)
- `/api/profiles/update-coordinates` - Atualizar coordenadas

## Recomendação

**Usar Opção 1 (Chamadas Diretas)** para a maioria das rotas e criar Edge Functions apenas para operações que realmente precisam de `service_role`.

## Próximos Passos

1. ✅ Capacitor configurado
2. ⏳ Ajustar código para usar Supabase direto no mobile
3. ⏳ Criar Edge Function para aceitar jobs (se necessário)
4. ⏳ Testar no dispositivo




