# 📱 Comandos para Rodar o Projeto Android

## ⚡ Forma Mais Fácil (RECOMENDADO)

### Via Android Studio (GUI):
```bash
# 1. Atualizar build e sincronizar
npm run build:mobile && npm run cap:sync

# 2. Abrir Android Studio
npm run cap:open:android

# 3. No Android Studio:
#    - Aguarde o Gradle sincronizar
#    - Selecione um dispositivo/emulador no topo
#    - Clique em Run (▶️) ou pressione Shift+F10
```

### Via Script PowerShell (Automático):
```powershell
# Script que configura Java automaticamente e roda o app
.\run-android.ps1
```

---

## 🚀 Fluxo Completo de Desenvolvimento

### 1. **Atualizar o Build e Sincronizar** (sempre que fizer mudanças no código)

```bash
# Faz build do Next.js para mobile
npm run build:mobile

# Sincroniza código web com projeto Android
npm run cap:sync

# Ou tudo de uma vez:
npm run build:mobile && npm run cap:sync
```

### 2. **Abrir no Android Studio**

```bash
npm run cap:open:android
```

### 3. **Rodar o App via Terminal (Gradle)**

**⚠️ Nota:** Requer Java configurado no PATH. Se der erro, use o Android Studio ou o script `run-android.ps1`

#### Opção A: Rodar em dispositivo/emulador conectado
```bash
cd android
.\gradlew installDebug
```

#### Opção B: Rodar e abrir automaticamente
```bash
cd android
.\gradlew installDebug
adb shell am start -n com.diaristlink.app/.MainActivity
```

#### Opção C: Build completo (APK)
```bash
cd android
.\gradlew assembleDebug
```
O APK será gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. **Rodar via Android Studio (GUI)**

1. Abra o Android Studio (já deve estar aberto)
2. Aguarde o Gradle sincronizar (barra inferior)
3. Selecione um dispositivo/emulador no topo
4. Clique no botão **Run** (▶️) ou pressione **Shift+F10**

---

## 🔄 Workflow Recomendado

### Durante Desenvolvimento:

```bash
# 1. Faça suas alterações no código (app/, components/, etc.)

# 2. Atualize o build mobile
npm run build:mobile

# 3. Sincronize com Android
npm run cap:sync

# 4. No Android Studio, clique em Run (▶️) novamente
# OU use o botão de reload no app (se estiver rodando)
```

### Atalho Rápido (tudo em um comando):

```bash
npm run build:mobile && npm run cap:sync
```

---

## 🛠️ Comandos Úteis do Gradle

### Limpar build anterior:
```bash
cd android
.\gradlew clean
```

### Verificar dependências:
```bash
cd android
.\gradlew dependencies
```

### Build de release (para publicação):
```bash
cd android
.\gradlew assembleRelease
```

### Instalar no dispositivo conectado:
```bash
cd android
.\gradlew installDebug
```

---

## 📱 Comandos ADB (Android Debug Bridge)

### Listar dispositivos conectados:
```bash
adb devices
```

### Instalar APK diretamente:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Desinstalar app:
```bash
adb uninstall com.diaristlink.app
```

### Ver logs em tempo real:
```bash
adb logcat
```

### Filtrar logs do Capacitor:
```bash
adb logcat | grep -i capacitor
```

---

## 🐛 Troubleshooting

### Erro: "Gradle sync failed"
```bash
cd android
.\gradlew clean
npm run cap:sync
```

### Erro: "SDK not found"
- Abra Android Studio → File → Settings → Appearance & Behavior → System Settings → Android SDK
- Instale o Android SDK necessário

### App não atualiza após mudanças:
```bash
npm run build:mobile
npm run cap:sync
# Depois, no Android Studio: Run → Run (ou Shift+F10)
```

### Limpar cache do Capacitor:
```bash
npm run cap:sync -- --force
```

---

## 📋 Checklist Antes de Rodar

- [ ] Android Studio instalado e configurado
- [ ] Android SDK instalado (via Android Studio)
- [ ] Emulador criado OU dispositivo físico conectado
- [ ] Build mobile atualizado (`npm run build:mobile`)
- [ ] Capacitor sincronizado (`npm run cap:sync`)
- [ ] Projeto aberto no Android Studio

---

## 🎯 Comandos Mais Usados (Resumo)

```bash
# Build + Sync (use sempre que mudar código)
npm run build:mobile && npm run cap:sync

# Abrir Android Studio
npm run cap:open:android

# Rodar via Gradle (do diretório raiz)
cd android && .\gradlew installDebug

# Ver dispositivos conectados
adb devices

# Ver logs
adb logcat | grep -i capacitor
```

---

**Dica:** Crie um alias no PowerShell para facilitar:
```powershell
# Adicione ao seu perfil PowerShell ($PROFILE)
function Build-Android {
    npm run build:mobile
    npm run cap:sync
    Write-Host "✅ Build e sync concluídos! Agora rode no Android Studio."
}
```

