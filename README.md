# DiaristaLink 🧹✨

Plataforma de marketplace on-demand para serviços domésticos, inspirada no Uber. Conecta empregadores a diaristas profissionais em tempo real com matching instantâneo baseado em localização GPS.

## 🚀 Características

- **Matching Instantâneo**: Baseado em localização GPS em tempo real
- **Mapa Interativo**: Visualização de diaristas disponíveis próximas (estilo Uber) - **100% Gratuito com OpenStreetMap**
- **Chat em Tempo Real**: Comunicação bidirecional via Supabase Realtime
- **Pagamentos Seguros**: Integração com Stripe (opcional)
- **UI Moderna**: Design elegante e intuitivo com Tailwind CSS + shadcn/ui
- **Mobile-First**: PWA responsivo com suporte a iOS/Android
- **100% Gratuito**: Usa apenas ferramentas gratuitas (Supabase free tier, OpenStreetMap, etc.)

## 🛠️ Tech Stack (100% Gratuito)

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (Auth + Database + Realtime) - Plano gratuito disponível
- **Maps**: React-Leaflet com OpenStreetMap (100% gratuito, sem API key)
- **Geocoding**: Nominatim (OpenStreetMap) - 100% gratuito, sem API key
- **Payments**: Stripe (opcional, tem plano gratuito para desenvolvimento)
- **Deploy**: Vercel (plano gratuito disponível)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no **Supabase** (plano gratuito disponível)
- Conta no **Stripe** (opcional, apenas se for usar pagamentos - tem plano gratuito para desenvolvimento)
- **Nenhuma API key necessária** para mapas ou geocoding (usamos ferramentas 100% gratuitas)

## 🏃 Como Começar

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd diaristLink
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase (OBRIGATÓRIO - Plano gratuito disponível)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (OPCIONAL - Apenas se for usar pagamentos)
# Tem plano gratuito para desenvolvimento
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NOTA: Mapas e Geocoding são 100% gratuitos (React-Leaflet + OpenStreetMap)
# Não é necessária nenhuma API key para mapas ou geocoding!
```

### 4. Execute o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 📁 Estrutura do Projeto

```
diaristLink/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Landing page
│   ├── login/             # Página de login
│   └── signup/            # Página de cadastro
├── components/            # Componentes React
│   ├── ui/                # Componentes shadcn/ui
│   ├── landing/           # Componentes da landing page
│   └── layout/            # Componentes de layout
├── lib/                   # Utilitários e configurações
│   ├── supabase/          # Clientes Supabase
│   └── utils.ts           # Funções utilitárias
└── public/                # Arquivos estáticos
```

## 🎯 Funcionalidades (MVP - Fase 1)

### ✅ Implementado

- [x] Setup inicial do projeto Next.js 14+
- [x] Configuração do Tailwind CSS e shadcn/ui
- [x] Landing page hero com CTA
- [x] Páginas de login e signup
- [x] Componentes UI base (Button, Card, Input, Label)
- [x] Estrutura de autenticação (preparada para Supabase)

### 🚧 Em Desenvolvimento

- [ ] Integração completa com Supabase Auth
- [ ] Mapa interativo com React-Leaflet/Mapbox
- [ ] Sistema de matching baseado em GPS
- [ ] Chat em tempo real
- [ ] Dashboard para empregadores e diaristas
- [ ] Integração com Stripe
- [ ] Sistema de avaliações

## 🔐 Segurança

- Row Level Security (RLS) no Supabase
- Validação de inputs com Zod
- Sanitização de dados
- Rate limiting
- Autenticação segura com Supabase Auth

## 📱 PWA

O projeto está configurado para ser um Progressive Web App (PWA), permitindo instalação em dispositivos móveis.

## 🧪 Testes

```bash
npm run test
```

## 📦 Build para Produção

```bash
npm run build
npm start
```

## 🚀 Deploy na Vercel

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente na Vercel
3. Deploy automático a cada push na branch main

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

---

**Desenvolvido com ❤️ para conectar empregadores e diaristas profissionais**

