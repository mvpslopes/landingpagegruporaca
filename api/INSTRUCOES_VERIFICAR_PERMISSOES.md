# 🔍 Como Verificar Permissões da Pasta

## Problema

Mesmo com a pasta em uma conta Google pessoal, o upload pode falhar se:
1. A pasta não estiver compartilhada corretamente com a Service Account
2. A Service Account não tiver permissão de Editor
3. A conta pessoal não tiver espaço disponível

## Solução: Verificar Permissões

### 1. Execute o Script de Diagnóstico

Acesse no navegador:
```
https://gruporaca.app.br/api/verificar-permissoes-pasta.php
```

Este script vai verificar:
- ✅ Se a pasta está compartilhada
- ✅ Se a Service Account tem permissão
- ✅ Qual o nível de permissão da Service Account
- ✅ Se a pasta está em Shared Drive ou conta pessoal
- ✅ Quem é o proprietário da pasta

### 2. Verifique os Resultados

O script vai mostrar:
- **✅ Verde**: Tudo certo
- **⚠️ Amarelo**: Avisos que podem ser resolvidos
- **❌ Vermelho**: Problemas que precisam ser corrigidos

### 3. Corrija os Problemas

#### Se a Service Account não tem permissão:

1. Abra a pasta `GRUPO_RACA` no Google Drive
2. Clique com botão direito → **"Compartilhar"**
3. Adicione: `grupo-raca-drive-service@tidal-triumph-481417-g3.iam.gserviceaccount.com`
4. Dê permissão: **Editor** (não Visualizador)
5. Clique em **"Enviar"**

#### Se a conta pessoal não tem espaço:

1. Verifique o espaço disponível no Google Drive da conta pessoal
2. Se necessário, libere espaço ou faça upgrade do plano

### 4. Verifique as Subpastas

Certifique-se de que todas as subpastas (`leiloes`, `deolhonomarchador`, etc.) também estão compartilhadas:

1. Abra cada subpasta
2. Verifique se a Service Account tem acesso
3. Se não tiver, compartilhe individualmente ou garanta que herda da pasta raiz

## Importante

- A pasta precisa estar **compartilhada** (não apenas acessível)
- A Service Account precisa ter permissão de **Editor** (writer)
- A conta pessoal precisa ter **espaço disponível**
- Todas as subpastas precisam estar acessíveis

