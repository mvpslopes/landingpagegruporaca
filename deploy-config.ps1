# Arquivo de Configuração de Deploy
# Preencha com suas credenciais da Hostinger e renomeie para deploy-config.ps1
# OU exporte essas variáveis no PowerShell antes de executar deploy.ps1

# Configurações FTP da Hostinger
$env:FTP_HOST = "ftp.seusite.com"  # Ex: ftp.gruporaca.com.br
$env:FTP_USER = "seu_usuario"      # Seu usuário FTP
$env:FTP_PASS = "sua_senha"        # Sua senha FTP
$env:FTP_PATH = "/mvpslopes/landingpagegruporaca"     # Caminho no servidor

# Para usar, execute:
# . .\deploy-config.ps1
# .\deploy.ps1 -FtpHost $env:FTP_HOST -FtpUser $env:FTP_USER -FtpPass $env:FTP_PASS -FtpPath $env:FTP_PATH

