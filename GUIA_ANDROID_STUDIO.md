# 📱 Guia Passo a Passo: Rodar App no Android Studio

## 🎯 Objetivo: Rodar o app DiaristLink no Android Studio

---

## 📋 Passo 1: Verificar se o projeto está aberto

No Android Studio, você deve ver:
- ✅ Barra lateral esquerda com a estrutura do projeto
- ✅ Pasta `android` com subpastas como `app`, `gradle`, etc.
- ✅ Arquivo `build.gradle` visível

**Se não estiver aberto:**
- File → Open → Navegue até `C:\Users\miche\OneDrive\DiaristLink-2\android`
- Clique em OK

---

## 📋 Passo 2: Aguardar Gradle sincronizar

1. **Olhe na barra inferior** do Android Studio
2. Você verá uma barra de progresso com "Gradle Sync" ou "Indexing"
3. **AGUARDE** até terminar (pode levar 1-3 minutos na primeira vez)
4. Quando terminar, você verá "Gradle build finished" ou similar

**Se der erro:**
- Clique em "Sync Project with Gradle Files" (ícone de elefante 🔵 no topo)
- Ou File → Sync Project with Gradle Files

---

## 📋 Passo 3: Criar/Iniciar um Emulador

### Opção A: Usar emulador existente

1. **No topo do Android Studio**, procure por um dropdown que diz "No Device" ou "No emulator"
2. Clique nele
3. Se aparecer um emulador na lista, selecione e clique em ▶️ (Play)

### Opção B: Criar novo emulador

1. **No topo**, clique no ícone de dispositivo 📱 (Device Manager) OU
2. Vá em **Tools → Device Manager**
3. Clique em **"Create Device"** (ou "+ Create Virtual Device")
4. Escolha um dispositivo (ex: Pixel 5, Pixel 6)
5. Clique em **Next**
6. Escolha uma imagem do sistema (ex: **API 33** ou **API 34** - Android 13/14)
   - Se não tiver, clique em **Download** ao lado
7. Clique em **Next** → **Finish**
8. O emulador aparecerá na lista - clique em ▶️ para iniciar

**⏱️ Primeira vez:** Pode levar 5-10 minutos para baixar e iniciar

---

## 📋 Passo 4: Selecionar o dispositivo

1. **No topo do Android Studio**, você verá um dropdown com dispositivos
2. Clique nele e selecione o emulador que você iniciou
3. Deve aparecer algo como: "Pixel_5_API_33" ou similar

---

## 📋 Passo 5: Rodar o App

### Método 1: Botão Run (RECOMENDADO)

1. **Procure o botão verde ▶️ "Run"** no topo do Android Studio
2. Ou pressione **Shift + F10**
3. O app será compilado e instalado automaticamente
4. Aguarde a compilação terminar (barra inferior)
5. O app abrirá automaticamente no emulador!

### Método 2: Menu

1. Vá em **Run → Run 'app'**
2. Ou pressione **Shift + F10**

---

## ✅ O que você deve ver:

1. **Barra inferior** mostrando progresso: "Gradle build running..."
2. **Emulador** iniciando (se ainda não estava rodando)
3. **App instalando** no emulador
4. **App abrindo automaticamente** - você verá a tela inicial do DiaristLink!

---

## 🐛 Problemas Comuns

### ❌ "No device selected"
- **Solução:** Crie/inicie um emulador (Passo 3)

### ❌ "Gradle sync failed"
- **Solução:** 
  1. File → Invalidate Caches → Invalidate and Restart
  2. Ou: File → Sync Project with Gradle Files

### ❌ "SDK not found"
- **Solução:**
  1. File → Settings → Appearance & Behavior → System Settings → Android SDK
  2. Instale o Android SDK necessário (API 33 ou 34)

### ❌ App não abre após instalar
- **Solução:** 
  1. No emulador, procure pelo app "DiaristLink" na lista de apps
  2. Toque para abrir manualmente

### ❌ Emulador muito lento
- **Solução:**
  1. Tools → Device Manager
  2. Edite o emulador (ícone de lápis)
  3. Show Advanced Settings
  4. Aumente RAM e CPU cores

---

## 🎯 Checklist Rápido

Antes de rodar, verifique:

- [ ] Projeto `android` aberto no Android Studio
- [ ] Gradle sincronizado (sem erros na barra inferior)
- [ ] Emulador criado e rodando (ou dispositivo físico conectado)
- [ ] Dispositivo selecionado no dropdown do topo
- [ ] Botão Run (▶️) disponível

---

## 📸 Onde encontrar as coisas:

```
Android Studio Layout:
┌─────────────────────────────────────────┐
│ [▶️ Run] [🛑 Stop] [📱 Device] [⚙️]   │ ← Barra de ferramentas
├─────────────────────────────────────────┤
│                                         │
│  [Estrutura do projeto]                │ ← Barra lateral esquerda
│                                         │
│  [Código/Arquivos]                     │ ← Área principal
│                                         │
├─────────────────────────────────────────┤
│ [Gradle Sync] [Build] [Logs]           │ ← Barra inferior
└─────────────────────────────────────────┘
```

---

## 🚀 Depois que rodar pela primeira vez:

1. ✅ App está funcionando!
2. 🔄 Para atualizar após mudanças no código:
   - Faça: `npm run build:mobile && npm run cap:sync`
   - No Android Studio: Clique em Run (▶️) novamente

---

## 💡 Dica Pro

**Atalho rápido:** Depois da primeira vez, você pode simplesmente:
1. Fazer mudanças no código
2. `npm run build:mobile && npm run cap:sync`
3. No Android Studio: **Shift + F10** (Run)

O app será atualizado automaticamente!

---

**🎉 Boa sorte! Se tiver dúvidas, me avise!**

