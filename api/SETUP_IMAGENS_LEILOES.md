# 📸 Setup de Imagens de Leilões

## Passo 1: Criar Pasta no Google Drive

Execute uma vez para criar a pasta onde as imagens serão armazenadas:

**URL:** https://gruporaca.app.br/api/create-leiloes-images-folder.php

**Acesso:** Apenas usuário ROOT pode executar este script.

Isso criará a pasta `IMAGENS_LEILOES_SITE` no Google Drive (pasta privada, visível apenas para ROOT).

---

## Passo 2: Como Funciona

1. **Upload de Imagem:**
   - Ao fazer upload de uma imagem no cadastro de leilões, ela será enviada para a pasta `IMAGENS_LEILOES_SITE`
   - O sistema automaticamente torna o arquivo público (mas a pasta permanece privada)
   - Um link direto é gerado e salvo no campo `image_path`

2. **Link Direto:**
   - Formato: `https://drive.google.com/uc?export=view&id=FILE_ID`
   - Este link funciona diretamente em `<img src="">`
   - Não precisa passar pelo PHP, é direto do Google Drive

3. **Exibição no Site:**
   - O site usa o link direto salvo em `image_path`
   - Se não tiver `image_path`, gera automaticamente a partir do `image_drive_id`

---

## Vantagens desta Solução

✅ **Sem problemas de headers PHP** - Link direto do Google Drive  
✅ **Mais rápido** - Imagens servidas diretamente pelo Google  
✅ **Sem carga no servidor** - Google Drive faz o trabalho pesado  
✅ **Cache automático** - Google Drive gerencia cache  
✅ **Escalável** - Suporta qualquer quantidade de imagens  

---

## Teste

1. Acesse: https://gruporaca.app.br/api/create-leiloes-images-folder.php
2. Deve retornar: `{"success": true, "message": "Pasta criada com sucesso", ...}`
3. Agora ao cadastrar um leilão e fazer upload de imagem, ela será salva nesta pasta
4. O link direto será gerado automaticamente

---

## Troubleshooting

**Se a pasta não for criada:**
- Verifique se o token OAuth está válido
- Acesse: https://gruporaca.app.br/api/oauth-drive.php para reautorizar

**Se o link não funcionar:**
- Verifique se o arquivo foi tornado público
- Acesse: https://gruporaca.app.br/api/create-public-image-link.php?file_id=SEU_FILE_ID
