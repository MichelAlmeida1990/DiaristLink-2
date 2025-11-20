# 📱 Guia Completo: Capacitor - Android e iOS

## ✅ O que foi implementado

1. ✅ Capacitor instalado e configurado
2. ✅ Plugins nativos instalados (geolocation, push-notifications, camera, etc)
3. ✅ Código ajustado para detectar plataforma mobile
4. ✅ Geolocalização usando plugin nativo quando disponível
5. ✅ Componente inicializador do Capacitor criado
6. ✅ Scripts npm adicionados para facilitar uso

---

## 🚀 Como usar

### 1. Build para Mobile

Primeiro, faça o build do Next.js para export estático:

```bash
npm run build:mobile
```

Isso cria a pasta `out/` com os arquivos estáticos.

### 2. Sincronizar com Capacitor

```bash
npm run cap:sync
```

Este comando:
- Copia os arquivos da pasta `out/` para as plataformas
- Atualiza plugins nativos
- Sincroniza configurações

### 3. Adicionar Plataformas

#### Android:
```bash
npm run cap:add:android
```

**Requisitos:**
- Android Studio instalado
- Android SDK configurado
- Variável de ambiente `ANDROID_HOME` configurada

#### iOS:
```bash
npm run cap:add:ios
```

**Requisitos:**
- macOS (não funciona no Windows)
- Xcode instalado
- CocoaPods instalado (`sudo gem install cocoapods`)

### 4. Abrir no IDE

#### Android Studio:
```bash
npm run cap:open:android
```

#### Xcode (macOS):
```bash
npm run cap:open:ios
```

### 5. Executar no Dispositivo/Emulador

#### Android:
1. Abra o projeto no Android Studio
2. Conecte um dispositivo Android ou inicie um emulador
3. Clique em "Run" (▶️)

#### iOS:
1. Abra o projeto no Xcode
2. Selecione um simulador ou dispositivo iOS
3. Clique em "Run" (▶️)

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run build:mobile` | Build do Next.js para mobile (export estático) |
| `npm run cap:sync` | Sincroniza código web com plataformas nativas |
| `npm run cap:add:android` | Adiciona plataforma Android |
| `npm run cap:add:ios` | Adiciona plataforma iOS |
| `npm run cap:open:android` | Abre projeto no Android Studio |
| `npm run cap:open:ios` | Abre projeto no Xcode |
| `npm run cap:copy` | Copia arquivos web para plataformas |
| `npm run cap:update` | Atualiza plugins e dependências |

---

## 🔧 Configurações

### capacitor.config.ts

O arquivo já está configurado com:
- ✅ App ID: `com.diaristlink.app`
- ✅ Nome do App: `DiaristLink`
- ✅ Diretório web: `out`
- ✅ Configurações de splash screen
- ✅ Configurações de status bar
- ✅ Configurações de notificações push

### Permissões Necessárias

#### Android (`android/app/src/main/AndroidManifest.xml`):

```xml
<!-- Geolocalização -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Câmera -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Notificações -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

#### iOS (`ios/App/App/Info.plist`):

```xml
<!-- Geolocalização -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para encontrar diaristas próximas</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Precisamos da sua localização para encontrar diaristas próximas</string>

<!-- Câmera -->
<key>NSCameraUsageDescription</key>
<string>Precisamos da câmera para tirar fotos de documentos</string>

<!-- Fotos -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Precisamos acessar suas fotos para enviar documentos</string>
```

**Nota:** Essas permissões serão adicionadas automaticamente quando você adicionar as plataformas.

---

## 🎯 Funcionalidades Implementadas

### ✅ Geolocalização Nativa

O código já está preparado para usar o plugin nativo do Capacitor quando disponível:

```typescript
import { getCurrentPosition } from '@/lib/geolocation'

// Funciona automaticamente no web e mobile
const position = await getCurrentPosition()
```

### ✅ Detecção de Plataforma

```typescript
import { isCapacitor, isIOS, isAndroid, isWeb } from '@/lib/capacitor'

if (isCapacitor()) {
  // Código específico para app mobile
}

if (isIOS()) {
  // Código específico para iOS
}

if (isAndroid()) {
  // Código específico para Android
}
```

### ✅ Inicialização Automática

O componente `CapacitorInitializer` já está no layout e:
- Configura a status bar
- Esconde o splash screen
- Configura o botão voltar do Android
- Adiciona listeners de estado do app

---

## 📦 Publicação nas Lojas

### Android (Google Play Store)

1. **Gerar assinatura:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Criar conta no Google Play Console**
3. **Upload do AAB** (Android App Bundle)
4. **Preencher informações do app**
5. **Enviar para revisão**

### iOS (App Store)

1. **Configurar certificados no Xcode:**
   - Abra o projeto no Xcode
   - Vá em "Signing & Capabilities"
   - Selecione sua equipe de desenvolvimento

2. **Gerar build:**
   - Product → Archive
   - Distribuir App → App Store Connect

3. **Criar conta no App Store Connect**
4. **Upload do IPA**
5. **Preencher informações do app**
6. **Enviar para revisão**

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@capacitor/core'"

```bash
npm install
npm run cap:sync
```

### Erro: "Platform not found"

```bash
npm run cap:add:android  # ou cap:add:ios
npm run cap:sync
```

### Build do Next.js falha

Certifique-se de que não há rotas dinâmicas ou API routes sendo usadas no mobile. O Capacitor precisa de export estático.

### Geolocalização não funciona no mobile

1. Verifique se as permissões estão configuradas
2. Teste em dispositivo real (emulador pode não ter GPS)
3. Verifique logs: `npx cap run android --livereload`

### App não atualiza após mudanças

```bash
npm run build:mobile
npm run cap:sync
```

Depois, recarregue o app no dispositivo.

---

## 📚 Recursos Úteis

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Guia de Plugins](https://capacitorjs.com/docs/plugins)
- [Android Setup](https://capacitorjs.com/docs/android)
- [iOS Setup](https://capacitorjs.com/docs/ios)

---

## ✅ Checklist de Implementação

- [x] Capacitor instalado
- [x] Plugins nativos instalados
- [x] Configuração básica feita
- [x] Código ajustado para mobile
- [x] Geolocalização nativa implementada
- [x] Scripts npm criados
- [ ] Plataforma Android adicionada (requer Android Studio)
- [ ] Plataforma iOS adicionada (requer macOS + Xcode)
- [ ] Testes em dispositivo real
- [ ] Publicação nas lojas

---

**Próximos passos:** Adicione as plataformas quando tiver os requisitos instalados (Android Studio para Android, Xcode para iOS).




