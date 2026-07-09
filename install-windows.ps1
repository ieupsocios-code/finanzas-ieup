# ============================================
# INSTALADOR AUTOMÁTICO FINANZAS IEUP
# Para Windows PowerShell
# ============================================

Write-Host "
██████╗ ███████╗ ██████╗███████╗██╗ █████╗ ███████╗
╚════██╗██╔════╝██╔════╝██╔════╝██║██╔══██╗██╔════╝
 █████╔╝█████╗  ██║     █████╗  ██║███████║███████╗
 ╚═══██╗██╔══╝  ██║     ██╔══╝  ██║██╔══██║╚════██║
 █████╔╝███████╗╚██████╗███████╗██║██║  ██║███████║
 ╚════╝ ╚══════╝ ╚═════╝╚══════╝╚═╝╚═╝  ╚═╝╚══════╝
                                                    
Iglesia Evangélica Unión Pentecostal
Sistema de Finanzas v1.0.0
================================================
" -ForegroundColor Cyan

# Verificar si se ejecuta como administrador
$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match 'S-1-5-32-544')

if (-not $isAdmin) {
    Write-Host "⚠️  Este script requiere permisos de administrador." -ForegroundColor Yellow
    Write-Host "Por favor, ejecuta PowerShell como Administrador:" -ForegroundColor Yellow
    Write-Host "
1. Búsca 'PowerShell' en Windows
2. Haz clic derecho → 'Ejecutar como administrador'
3. Copia y pega este comando:

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
    " -ForegroundColor Cyan
    exit
}

# Función para mostrar mensajes
function Show-Status {
    param([string]$Message, [string]$Status = "Info")
    
    $color = switch($Status) {
        "Success" { "Green" }
        "Error" { "Red" }
        "Warning" { "Yellow" }
        default { "Cyan" }
    }
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $color
}

# 1. Verificar Node.js
Show-Status "Verificando Node.js..." "Info"

$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Show-Status "❌ Node.js no está instalado" "Error"
    Show-Status "Descarga desde: https://nodejs.org (LTS)" "Warning"
    Show-Status "Después reinicia este script" "Warning"
    exit
}

Show-Status "✅ Node.js $nodeVersion detectado" "Success"

# 2. Verificar npm
Show-Status "Verificando npm..." "Info"

$npmVersion = npm --version 2>$null
if ($null -eq $npmVersion) {
    Show-Status "❌ npm no está disponible" "Error"
    exit
}

Show-Status "✅ npm $npmVersion detectado" "Success"

# 3. Verificar Git (opcional pero recomendado)
Show-Status "Verificando Git..." "Info"

$gitVersion = git --version 2>$null
if ($null -eq $gitVersion) {
    Show-Status "⚠️  Git no está instalado (opcional)" "Warning"
    Show-Status "Descarga desde: https://git-scm.com" "Info"
} else {
    Show-Status "✅ Git $gitVersion detectado" "Success"
}

# 4. Limpiar cache de npm (opcional)
Write-Host ""
Show-Status "¿Limpiar cache de npm? (S/N)" "Info"
$limpiar = Read-Host

if ($limpiar -eq "S" -or $limpiar -eq "s") {
    Show-Status "Limpiando cache..." "Info"
    npm cache clean --force
    Show-Status "✅ Cache limpio" "Success"
}

# 5. Instalar dependencias
Write-Host ""
Show-Status "Instalando dependencias del proyecto..." "Info"
Show-Status "Esto puede tardar 2-5 minutos..." "Warning"

npm install

if ($LASTEXITCODE -ne 0) {
    Show-Status "❌ Error al instalar dependencias" "Error"
    exit
}

Show-Status "✅ Dependencias instaladas correctamente" "Success"

# 6. Crear archivo .env.local si no existe
Write-Host ""
Show-Status "Configurando variables de entorno..." "Info"

if (Test-Path ".env.local") {
    Show-Status "✅ Archivo .env.local ya existe" "Success"
} else {
    $envContent = @"
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu-anon-key-aqui
"@

    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Show-Status "✅ Archivo .env.local creado" "Success"
    Show-Status "⚠️  Edita .env.local con tus credenciales de Supabase" "Warning"
}

# 7. Información final
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Show-Status "✅ Instalación completada correctamente!" "Success"
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Yellow

Write-Host "
1️⃣  Edita el archivo .env.local con tus credenciales:
    - Abre .env.local con Bloc de Notas
    - Reemplaza tu URL de Supabase
    - Reemplaza tu anon key de Supabase

2️⃣  Inicia el servidor de desarrollo:
    " -ForegroundColor Green

Write-Host "   npm run dev" -ForegroundColor Cyan

Write-Host "
3️⃣  Abre en tu navegador:
    " -ForegroundColor Green

Write-Host "   http://localhost:3000" -ForegroundColor Cyan

Write-Host "
Para más información, ve a:
    " -ForegroundColor Green

Write-Host "   README.md o INSTRUCCIONES-WINDOWS.md" -ForegroundColor Cyan

Write-Host ""
Write-Host "¿Quieres iniciar el servidor ahora? (S/N)" -ForegroundColor Yellow
$iniciar = Read-Host

if ($iniciar -eq "S" -or $iniciar -eq "s") {
    Show-Status "Iniciando servidor de desarrollo..." "Info"
    npm run dev
} else {
    Show-Status "Para iniciar después, ejecuta: npm run dev" "Info"
}
