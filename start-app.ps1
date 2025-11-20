# Script para iniciar o app DiaristLink no dispositivo/emulador
# Encontra o ADB automaticamente e abre o app

Write-Host "🚀 Procurando ADB..." -ForegroundColor Cyan

# Caminhos comuns onde o ADB pode estar instalado
$adbPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ProgramFiles\Android\Android Studio\platform-tools\adb.exe",
    "$env:ProgramFiles(x86)\Android\Android Studio\platform-tools\adb.exe",
    "$env:LOCALAPPDATA\Programs\Android\Android Studio\platform-tools\adb.exe",
    "$env:ANDROID_HOME\platform-tools\adb.exe",
    "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe"
)

$adbFound = $null
foreach ($path in $adbPaths) {
    if (Test-Path $path) {
        $adbFound = $path
        Write-Host "✅ ADB encontrado: $path" -ForegroundColor Green
        break
    }
}

if (-not $adbFound) {
    Write-Host "⚠️  ADB não encontrado automaticamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 O app já foi instalado! Você pode:" -ForegroundColor Cyan
    Write-Host "   1. Abrir manualmente o app 'DiaristLink' no seu dispositivo/emulador" -ForegroundColor Gray
    Write-Host "   2. Ou configurar o ADB manualmente:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Para encontrar o ADB:" -ForegroundColor Cyan
    Write-Host "   - Abra o Android Studio" -ForegroundColor Gray
    Write-Host "   - Vá em File → Settings → Appearance & Behavior → System Settings → Android SDK" -ForegroundColor Gray
    Write-Host "   - Veja o caminho do 'Android SDK Location'" -ForegroundColor Gray
    Write-Host "   - O ADB está em: [SDK Location]\platform-tools\adb.exe" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Depois adicione ao PATH ou use:" -ForegroundColor Cyan
    Write-Host "   \$env:PATH += ';C:\Users\SeuUsuario\AppData\Local\Android\Sdk\platform-tools'" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "📱 Verificando dispositivos conectados..." -ForegroundColor Cyan
& $adbFound devices

Write-Host ""
Write-Host "🚀 Iniciando o app DiaristLink..." -ForegroundColor Cyan
& $adbFound shell am start -n com.diaristlink.app/.MainActivity

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ App iniciado com sucesso!" -ForegroundColor Green
    Write-Host "   O app deve aparecer no seu dispositivo/emulador agora." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Não foi possível iniciar automaticamente." -ForegroundColor Yellow
    Write-Host "   Mas o app está instalado! Abra manualmente no dispositivo/emulador." -ForegroundColor Cyan
}

