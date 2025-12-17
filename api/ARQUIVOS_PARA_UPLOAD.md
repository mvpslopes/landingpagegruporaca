# 📤 Arquivos para Upload na Hospedagem

## ✅ Arquivos que Foram Modificados

Você precisa fazer upload destes arquivos atualizados para a hospedagem:

### 1. **api/config/drive_config.php** ⚠️ IMPORTANTE
- **O que mudou:** `root_folder_id` atualizado para o novo ID da pasta
- **Caminho na hospedagem:** `/public_html/api/config/drive_config.php`
- **Por quê:** O sistema precisa saber qual é a nova pasta raiz

### 2. **api/drive_service.php** ⚠️ IMPORTANTE
- **O que mudou:** Código para transferir propriedade do arquivo após upload
- **Caminho na hospedagem:** `/public_html/api/drive_service.php`
- **Por quê:** Tenta resolver o problema de quota transferindo propriedade

## 📋 Como Fazer Upload

### Opção 1: Via FTP/FileZilla

1. Conecte-se ao servidor via FTP
2. Navegue até `/public_html/api/`
3. Faça upload dos arquivos:
   - `config/drive_config.php`
   - `drive_service.php`

### Opção 2: Via Painel de Controle (File Manager)

1. Acesse o painel de controle da Hostinger
2. Abra o File Manager
3. Navegue até `/public_html/api/`
4. Faça upload dos arquivos:
   - `config/drive_config.php`
   - `drive_service.php`

## ⚠️ Importante

- **Não esqueça** de fazer upload do `drive_config.php` - sem ele, o sistema não vai encontrar a pasta
- **Verifique** se os arquivos foram substituídos corretamente
- **Teste** o upload após fazer o upload dos arquivos

## 🧪 Após o Upload

1. Faça login como Larissa
2. Tente fazer upload de um arquivo
3. Verifique se funciona

## 📝 Checklist

- [ ] Upload de `api/config/drive_config.php` feito
- [ ] Upload de `api/drive_service.php` feito
- [ ] Verificou se os arquivos foram substituídos
- [ ] Testou o upload de arquivo

