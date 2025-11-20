# 🔧 Solução: API Routes no Mobile

## Problema

O Next.js com `output: 'export'` (export estático) **não suporta API Routes**. Isso significa que todas as rotas em `app/api/` não funcionarão no app mobile.

## Solução Implementada

### Opção Escolhida: Chamadas Diretas ao Supabase

Para o app mobile, todas as chamadas devem ser feitas **diretamente ao Supabase**, sem passar pelas API routes.

### Rotas que Precisam de Ajuste

#### 1. `/api/jobs/[id]/update-status` - Aceitar Jobs

**Problema:** Usa `service_role` para contornar RLS.

**Solução:** Criar uma Edge Function no Supabase ou ajustar RLS para permitir que diaristas aceitem jobs.

#### 2. `/api/diarists/nearby` - Buscar Diaristas Próximas

**Solução:** Fazer query direta no Supabase:

```typescript
const supabase = createClient()
const { data: diarists } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'diarist')
  .not('latitude', 'is', null)
  .not('longitude', 'is', null)
```

#### 3. `/api/jobs/available` - Buscar Jobs Disponíveis

**Solução:** Query direta:

```typescript
const { data: jobs } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'pending')
```

#### 4. `/api/geocode` - Geocoding

**Solução:** Usar Nominatim diretamente no cliente:

```typescript
const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
)
const data = await response.json()
```

#### 5. `/api/cep/[cep]` - Buscar CEP

**Solução:** Usar ViaCEP diretamente:

```typescript
const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
const data = await response.json()
```

#### 6. `/api/profiles/update-coordinates` - Atualizar Coordenadas

**Solução:** Update direto no Supabase:

```typescript
const { error } = await supabase
  .from('profiles')
  .update({ latitude, longitude })
  .eq('id', user.id)
```

## Implementação

### Detectar se está no mobile:

```typescript
import { isCapacitor } from '@/lib/capacitor'

if (isCapacitor()) {
  // Usar Supabase direto
} else {
  // Usar API routes
}
```

### Exemplo de função adaptável:

```typescript
async function fetchDiaristsNearby(lat: number, lon: number, radius: number = 10) {
  if (isCapacitor()) {
    // Mobile: query direta
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'diarist')
    // Filtrar por distância no cliente
    return data?.filter(diarist => {
      const distance = calculateDistance(lat, lon, diarist.latitude, diarist.longitude)
      return distance <= radius
    })
  } else {
    // Web: usar API route
    const response = await fetch(`/api/diarists/nearby?lat=${lat}&lon=${lon}&radius=${radius}`)
    return await response.json()
  }
}
```

## Próximos Passos

1. ⏳ Criar funções adaptáveis que detectam plataforma
2. ⏳ Ajustar código para usar Supabase direto no mobile
3. ⏳ Criar Edge Function para aceitar jobs (se necessário)
4. ⏳ Testar no dispositivo

## Nota

As API routes continuam funcionando normalmente na versão web. Apenas o build mobile precisa usar Supabase direto.




