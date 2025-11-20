# Script para rodar o app Android
# Este script configura o Java automaticamente e roda o app

Write-Host "🚀 Preparando para rodar o app Android..." -ForegroundColor Cyan

# Tentar encontrar o Java do Android Studio
$javaPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\jbr\bin\java.exe",
    "$env:ProgramFiles\Android\Android Studio\jbr\bin\java.exe",
    "$env:ProgramFiles(x86)\Android\Android Studio\jbr\bin\java.exe",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\jbr\bin\java.exe"
)

$javaFound = $false
foreach ($path in $javaPaths) {
    if (Test-Path $path) {
        $javaDir = Split-Path (Split-Path $path)
        $env:JAVA_HOME = $javaDir
        Write-Host "✅ Java encontrado: $javaDir" -ForegroundColor Green
        $javaFound = $true
        break
    }
}

if (-not $javaFound) {
    Write-Host "⚠️  Java não encontrado automaticamente." -ForegroundColor Yellow
    Write-Host "📝 Por favor, configure o JAVA_HOME manualmente ou use o Android Studio." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para configurar manualmente:" -ForegroundColor Cyan
    Write-Host "  \$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ou simplesmente use o Android Studio:" -ForegroundColor Cyan
    Write-Host "  npm run cap:open:android" -ForegroundColor Gray
    Write-Host "  Depois clique em Run (▶️)" -ForegroundColor Gray
    exit 1
}

# Adicionar Java ao PATH temporariamente
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verificar se está na pasta android
if (-not (Test-Path "android\gradlew.bat")) {
    Write-Host "📁 Mudando para pasta android..." -ForegroundColor Cyan
    Set-Location android
}

# Rodar o Gradle
Write-Host ""
Write-Host "🔨 Compilando e instalando o app..." -ForegroundColor Cyan
Write-Host ""

.\gradlew.bat installDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ App instalado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 O app deve aparecer no seu dispositivo/emulador." -ForegroundColor Cyan
    Write-Host "   Se não aparecer automaticamente, abra manualmente." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Erro ao instalar o app." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Dica: Use o Android Studio para rodar o app:" -ForegroundColor Yellow
    Write-Host "   npm run cap:open:android" -ForegroundColor Gray
    Write-Host "   Depois clique em Run (▶️)" -ForegroundColor Gray
}

