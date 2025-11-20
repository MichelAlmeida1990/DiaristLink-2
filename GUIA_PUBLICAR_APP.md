# 📱 Guia Completo: Como Publicar o App DiaristLink

## 🎯 Objetivo: Publicar o app nas lojas (Google Play Store e Apple App Store)

---

## 📋 PARTE 1: Preparação Geral

### ✅ Checklist Antes de Publicar

- [ ] App funcionando corretamente no emulador/dispositivo
- [ ] Testes realizados em todas as funcionalidades principais
- [ ] Ícone do app criado (512x512px para Android, 1024x1024px para iOS)
- [ ] Tela de splash screen configurada
- [ ] Nome do app definido
- [ ] Descrição do app escrita
- [ ] Screenshots do app preparados
- [ ] Política de privacidade criada (obrigatório)

---

## 🤖 PARTE 2: Publicar no Google Play Store (Android)

### Passo 1: Criar Conta de Desenvolvedor

1. Acesse: https://play.google.com/console
2. Faça login com sua conta Google
3. Pague a taxa única de **$25 USD** (válida para sempre)
4. Complete o cadastro de desenvolvedor

### Passo 2: Gerar APK/AAB Assinado

#### Opção A: Gerar via Android Studio (RECOMENDADO)

1. **Abra o projeto Android no Android Studio**
   - File → Open → Selecione a pasta `android`

2. **Configure a assinatura:**
   - Build → Generate Signed Bundle / APK
   - Selecione **Android App Bundle (AAB)** ← RECOMENDADO
   - Clique em **Next**

3. **Criar nova keystore (primeira vez):**
   - Clique em **Create new...**
   - Preencha:
     - **Key store path:** Escolha onde salvar (ex: `C:\Users\miche\diaristlink-release.jks`)
     - **Password:** Crie uma senha forte e ANOTE!
     - **Key alias:** `diaristlink-key`
     - **Password (key):** Pode ser a mesma do keystore
     - **Validity:** 25 anos (padrão)
     - **Certificate:** Preencha seus dados
   - Clique em **OK**

4. **Se já tiver keystore:**
   - Clique em **Choose existing...**
   - Selecione seu arquivo `.jks` ou `.keystore`
   - Digite as senhas

5. **Selecionar variante:**
   - Marque **release**
   - Clique em **Next**

6. **Finalizar:**
   - Marque **V1 (Jar Signature)** e **V2 (Full APK Signature)**
   - Clique em **Finish**
   - Aguarde a compilação
   - O arquivo `.aab` será gerado em: `android/app/release/app-release.aab`

#### Opção B: Gerar via Linha de Comando

```bash
# 1. Criar keystore (apenas primeira vez)
keytool -genkey -v -keystore diaristlink-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias diaristlink-key

# 2. Criar arquivo key.properties em android/
storePassword=sua_senha_aqui
keyPassword=sua_senha_aqui
keyAlias=diaristlink-key
storeFile=../diaristlink-release.jks

# 3. Configurar build.gradle (ver Passo 3)

# 4. Gerar AAB
cd android
./gradlew bundleRelease
```

### Passo 3: Configurar Assinatura Automática (Opcional mas Recomendado)

1. **Criar arquivo `android/key.properties`:**
```properties
storePassword=sua_senha_aqui
keyPassword=sua_senha_aqui
keyAlias=diaristlink-key
storeFile=../diaristlink-release.jks
```

2. **Editar `android/app/build.gradle`:**
```gradle
// Adicionar no início do arquivo
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... código existente ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... outras configurações ...
        }
    }
}
```

### Passo 4: Upload no Google Play Console

1. **Acesse:** https://play.google.com/console
2. **Criar novo app:**
   - Clique em **"Criar app"**
   - Preencha:
     - **Nome do app:** DiaristLink
     - **Idioma padrão:** Português (Brasil)
     - **Tipo de app:** App
     - **Gratuito ou pago:** Gratuito
   - Clique em **Criar**

3. **Preencher informações do app:**
   - **Nome do app:** DiaristLink
   - **Descrição curta:** (até 80 caracteres)
   - **Descrição completa:** (até 4000 caracteres)
   - **Categoria:** Produtividade / Serviços
   - **Classificação de conteúdo:** Para todos / 12+

4. **Upload do AAB:**
   - Vá em **Produção** → **Criar nova versão**
   - Faça upload do arquivo `.aab` gerado
   - Preencha as notas da versão

5. **Adicionar recursos:**
   - **Ícone:** 512x512px (PNG)
   - **Screenshots:** Mínimo 2, recomendado 4-8
     - Telefone: 1080x1920px ou 1440x2560px
     - Tablet (opcional): 1200x1920px
   - **Imagem em destaque:** 1024x500px (opcional)

6. **Preencher formulários:**
   - **Política de privacidade:** URL obrigatória
   - **Classificação de conteúdo:** Questionário
   - **Preços e distribuição:** Países, preço, etc.

7. **Enviar para revisão:**
   - Revise todas as informações
   - Clique em **"Enviar para revisão"**
   - Aguarde aprovação (geralmente 1-3 dias)

---

## 🍎 PARTE 3: Publicar no Apple App Store (iOS)

### Pré-requisitos

- **Mac** (obrigatório para publicar iOS)
- **Conta Apple Developer:** $99 USD/ano
- **Xcode instalado**

### Passo 1: Criar Conta Apple Developer

1. Acesse: https://developer.apple.com/programs/
2. Faça login com sua Apple ID
3. Inscreva-se no programa ($99 USD/ano)
4. Aguarde aprovação (pode levar alguns dias)

### Passo 2: Configurar no Xcode

1. **Abrir projeto iOS:**
   ```bash
   npm run cap:open:ios
   ```

2. **Configurar assinatura:**
   - No Xcode, selecione o projeto
   - Vá em **Signing & Capabilities**
   - Selecione seu **Team** (conta Apple Developer)
   - Marque **Automatically manage signing**

3. **Configurar Bundle Identifier:**
   - Deve ser único (ex: `com.diaristlink.app`)
   - Não pode ser alterado depois!

### Passo 3: Gerar Build

1. **No Xcode:**
   - Selecione **Any iOS Device** como destino
   - Product → Archive
   - Aguarde a compilação

2. **Organizer:**
   - Após o Archive, o Organizer abre automaticamente
   - Selecione o build
   - Clique em **Distribute App**

3. **Escolher método:**
   - **App Store Connect** (para publicar)
   - Siga o assistente

### Passo 4: Upload via App Store Connect

1. **Acesse:** https://appstoreconnect.apple.com
2. **Criar novo app:**
   - Meus Apps → **+** → Novo App
   - Preencha:
     - **Nome:** DiaristLink
     - **Idioma principal:** Português (Brasil)
     - **Bundle ID:** O mesmo configurado no Xcode
     - **SKU:** Identificador único (ex: diaristlink-001)

3. **Preencher informações:**
   - **Descrição:** Até 4000 caracteres
   - **Palavras-chave:** Separe por vírgulas
   - **Categoria:** Produtividade
   - **Classificação:** 4+

4. **Adicionar recursos:**
   - **Ícone:** 1024x1024px (PNG, sem transparência)
   - **Screenshots:** 
     - iPhone 6.7": 1290x2796px
     - iPhone 6.5": 1242x2688px
     - iPad Pro: 2048x2732px

5. **Enviar build:**
   - Vá em **Versão do App**
   - Clique em **+ Versão**
   - Selecione o build enviado
   - Preencha as notas da versão

6. **Enviar para revisão:**
   - Revise todas as informações
   - Clique em **"Enviar para revisão"**
   - Aguarde aprovação (geralmente 1-7 dias)

---

## 📝 PARTE 4: Recursos Necessários

### Ícones

**Android:**
- Ícone principal: 512x512px (PNG)
- Ícones adaptativos: Vários tamanhos (gerados automaticamente)

**iOS:**
- Ícone: 1024x1024px (PNG, sem transparência)

**Ferramentas para criar ícones:**
- https://www.figma.com (design)
- https://www.canva.com (templates)
- https://icon.kitchen (gerador de ícones adaptativos)

### Screenshots

**Android:**
- Telefone: 1080x1920px ou 1440x2560px
- Tablet: 1200x1920px (opcional)
- Mínimo: 2 screenshots
- Recomendado: 4-8 screenshots

**iOS:**
- iPhone 6.7": 1290x2796px
- iPhone 6.5": 1242x2688px
- iPad Pro: 2048x2732px (opcional)

**Dicas:**
- Mostre as funcionalidades principais
- Use dispositivos reais para capturar
- Adicione textos explicativos (opcional)

### Política de Privacidade

**Obrigatório para ambas as lojas!**

Você precisa criar uma página web com sua política de privacidade e fornecer a URL.

**Conteúdo mínimo:**
- Quais dados são coletados
- Como os dados são usados
- Como os dados são armazenados
- Direitos do usuário
- Contato para dúvidas

**Onde hospedar:**
- GitHub Pages (grátis)
- Vercel (grátis)
- Netlify (grátis)
- Seu próprio site

---

## 🔐 PARTE 5: Segurança e Boas Práticas

### ⚠️ IMPORTANTE: Guarde suas senhas e keystore!

- **Keystore (.jks):** Guarde em local seguro e faça backup!
- **Senhas:** Se perder, não conseguirá atualizar o app!
- **Backup:** Faça backup do keystore em múltiplos locais

### Checklist de Segurança

- [ ] Keystore guardado em local seguro
- [ ] Backup do keystore feito
- [ ] Senhas anotadas em local seguro
- [ ] Política de privacidade criada
- [ ] Termos de uso criados (recomendado)
- [ ] API keys não expostas no código

---

## 📊 PARTE 6: Após Publicar

### Monitoramento

**Google Play Console:**
- Estatísticas de downloads
- Avaliações e comentários
- Relatórios de crash
- Receitas (se app pago)

**App Store Connect:**
- Downloads e vendas
- Avaliações
- Relatórios de crash
- Analytics

### Atualizações

**Para atualizar o app:**

1. **Fazer mudanças no código**
2. **Atualizar versão:**
   - Android: `android/app/build.gradle` → `versionCode` e `versionName`
   - iOS: `ios/App/App.xcodeproj` → Version e Build
3. **Gerar novo build**
4. **Upload na loja**
5. **Enviar para revisão**

---

## 🆘 Problemas Comuns

### Android

**Erro: "Duplicate entry"**
- Solução: Aumente o `versionCode` no `build.gradle`

**Erro: "Keystore not found"**
- Solução: Verifique o caminho do keystore no `key.properties`

**App rejeitado: "Missing privacy policy"**
- Solução: Adicione URL da política de privacidade

### iOS

**Erro: "No signing certificate"**
- Solução: Configure o Team no Xcode

**Erro: "Bundle ID already exists"**
- Solução: Use um Bundle ID único

**App rejeitado: "Guideline 2.1 - Performance"**
- Solução: Teste o app completamente antes de enviar

---

## 📚 Recursos Úteis

- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com
- **Documentação Capacitor:** https://capacitorjs.com/docs
- **Guia Android:** https://developer.android.com/distribute
- **Guia iOS:** https://developer.apple.com/app-store

---

## ✅ Checklist Final

Antes de publicar, certifique-se de:

- [ ] App testado completamente
- [ ] Ícones criados
- [ ] Screenshots preparados
- [ ] Política de privacidade criada e hospedada
- [ ] Build assinado gerado
- [ ] Informações do app preenchidas
- [ ] Formulários da loja completos
- [ ] App enviado para revisão

---

**🎉 Boa sorte com a publicação! Se tiver dúvidas, me avise!**

