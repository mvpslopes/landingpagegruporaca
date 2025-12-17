# Script de Deploy para Hostinger
# Configuração FTP da Hostinger

param(
    [string]$FtpHost = "",
    [string]$FtpUser = "",
    [string]$FtpPass = "",
    [string]$FtpPath = "/public_html"
)

Write-Host "🚀 Iniciando deploy para Hostinger..." -ForegroundColor Cyan

# Verificar se as credenciais foram fornecidas
if ([string]::IsNullOrEmpty($FtpHost) -or [string]::IsNullOrEmpty($FtpUser) -or [string]::IsNullOrEmpty($FtpPass)) {
    Write-Host "❌ Erro: Credenciais FTP não fornecidas!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Uso: .\deploy.ps1 -FtpHost 'ftp.seusite.com' -FtpUser 'usuario' -FtpPass 'senha' -FtpPath '/public_html'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ou configure as variáveis no arquivo deploy-config.ps1" -ForegroundColor Yellow
    exit 1
}

# Passo 1: Build do projeto
Write-Host "📦 Construindo o projeto..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer build do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green

# Passo 2: Verificar se a pasta dist existe
if (-not (Test-Path "dist")) {
    Write-Host "❌ Pasta 'dist' não encontrada!" -ForegroundColor Red
    exit 1
}

# Passo 3: Upload via FTP usando WinSCP ou PowerShell
Write-Host "📤 Fazendo upload dos arquivos..." -ForegroundColor Cyan

# Criar arquivo temporário com comandos FTP
$ftpScript = @"
open $FtpHost
$FtpUser
$FtpPass
binary
cd $FtpPath
lcd dist
prompt
mput *.*
mput -r *
quit
"@

$ftpScript | Out-File -FilePath "ftp-upload.txt" -Encoding ASCII

# Tentar usar PowerShell FTP (método básico)
try {
    $ftpUri = "ftp://$FtpHost$FtpPath"
    Write-Host "Conectando a: $ftpUri" -ForegroundColor Yellow
    
    # Criar função para upload recursivo
    function Upload-Folder {
        param([string]$LocalPath, [string]$RemotePath, [string]$FtpHost, [string]$FtpUser, [string]$FtpPass)
        
        $items = Get-ChildItem -Path $LocalPath -Recurse
        
        foreach ($item in $items) {
            $relativePath = $item.FullName.Substring($LocalPath.Length + 1)
            $remoteFilePath = "$RemotePath/$relativePath" -replace '\\', '/'
            
            if ($item.PSIsContainer) {
                # Criar diretório
                try {
                    $request = [System.Net.FtpWebRequest]::Create("ftp://$FtpHost$remoteFilePath")
                    $request.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
                    $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
                    $request.UsePassive = $true
                    $response = $request.GetResponse()
                    $response.Close()
                } catch {
                    # Diretório pode já existir
                }
            } else {
                # Upload de arquivo
                $fileUri = "ftp://$FtpHost$remoteFilePath"
                $request = [System.Net.FtpWebRequest]::Create($fileUri)
                $request.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
                $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
                $request.UseBinary = $true
                $request.UsePassive = $true
                
                $fileContent = [System.IO.File]::ReadAllBytes($item.FullName)
                $request.ContentLength = $fileContent.Length
                
                $requestStream = $request.GetRequestStream()
                $requestStream.Write($fileContent, 0, $fileContent.Length)
                $requestStream.Close()
                
                $response = $request.GetResponse()
                Write-Host "  ✓ $relativePath" -ForegroundColor Gray
                $response.Close()
            }
        }
    }
    
    # Upload da pasta dist (frontend)
    Write-Host "📤 Enviando arquivos do frontend (dist)..." -ForegroundColor Cyan
    Upload-Folder -LocalPath "dist" -RemotePath $FtpPath -FtpHost $FtpHost -FtpUser $FtpUser -FtpPass $FtpPass
    
    # Upload da pasta api (backend PHP)
    if (Test-Path "api") {
        Write-Host "📤 Enviando arquivos da API (api)..." -ForegroundColor Cyan
        Upload-Folder -LocalPath "api" -RemotePath "$FtpPath/api" -FtpHost $FtpHost -FtpUser $FtpUser -FtpPass $FtpPass
    } else {
        Write-Host "⚠️  Pasta 'api' não encontrada, pulando upload da API" -ForegroundColor Yellow
    }
    
    Write-Host "✅ Upload concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Seu site está no ar!" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erro durante o upload: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Dica: Use um cliente FTP como FileZilla ou WinSCP para fazer upload manual:" -ForegroundColor Yellow
    Write-Host "   1. Abra FileZilla ou WinSCP" -ForegroundColor Yellow
    Write-Host "   2. Conecte-se a: $FtpHost" -ForegroundColor Yellow
    Write-Host "   3. Usuário: $FtpUser" -ForegroundColor Yellow
    Write-Host "   4. Navegue até: $FtpPath" -ForegroundColor Yellow
    Write-Host "   5. Faça upload de TODOS os arquivos da pasta 'dist'" -ForegroundColor Yellow
    Write-Host "   6. Faça upload da pasta 'api' para $FtpPath/api" -ForegroundColor Yellow
    exit 1
} finally {
    # Limpar arquivo temporário
    if (Test-Path "ftp-upload.txt") {
        Remove-Item "ftp-upload.txt"
    }
}

Write-Host ""
Write-Host "✨ Deploy finalizado!" -ForegroundColor Green

