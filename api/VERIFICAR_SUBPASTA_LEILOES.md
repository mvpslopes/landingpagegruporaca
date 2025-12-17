# 🔍 Verificar Subpasta `leiloes`

A pasta raiz está compartilhada corretamente! Agora precisamos verificar a subpasta `leiloes` que a Larissa usa.

## 📋 Passo a Passo

### 1. Acesse a Subpasta `leiloes`

1. Entre na pasta `GRUPO_RACA` no Google Drive
2. Localize a subpasta `leiloes`
3. Clique com botão direito na pasta `leiloes`
4. Selecione **"Compartilhar"**

### 2. Verificar Permissões

Verifique se aparece o email:
```
grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com
```

### 3. Se a Service Account NÃO estiver na lista:

1. Clique em **"Adicionar pessoas e grupos"**
2. Digite: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
3. Selecione a permissão: **Editor**
4. Clique em **"Enviar"**

### 4. Verificar Herança de Permissões

**Opção A: Herança Automática (Recomendado)**
- Se a pasta raiz está compartilhada, as subpastas podem herdar
- Mas é mais seguro compartilhar explicitamente

**Opção B: Compartilhar Individualmente**
- Compartilhe cada subpasta individualmente com a Service Account
- Isso garante que todas tenham acesso

## ✅ Checklist

- [ ] Subpasta `leiloes` está compartilhada com a Service Account
- [ ] Service Account tem permissão de **Editor** na subpasta
- [ ] Conta pessoal (`gruporacaleiloes@gmail.com`) tem espaço disponível

## 🔧 Solução Rápida

Se o upload ainda não funcionar após compartilhar a subpasta:

1. **Verifique o espaço disponível:**
   - Google Drive → Configurações → Armazenamento
   - Certifique-se de que há espaço livre

2. **Teste com um arquivo pequeno:**
   - Tente fazer upload de uma imagem pequena (< 1MB)
   - Se funcionar, o problema pode ser tamanho do arquivo

3. **Verifique os logs:**
   - O erro específico pode indicar outro problema
   - Compartilhe a mensagem de erro completa

