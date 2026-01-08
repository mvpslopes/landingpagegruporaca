# 📊 Resumo de Usuários do Sistema - Grupo Raça

## Tabela Completa de Usuários

| # | Email | Nome | Perfil | Pasta de Acesso | Upload | Download | Deletar | Ver Todas Pastas | Gerenciar Usuários | Gerenciar Permissões |
|---|-------|------|--------|-----------------|--------|----------|---------|------------------|-------------------|---------------------|
| 1 | marcus@gruporaca.com.br | Marcus Lopes | **ROOT** | Todas (*) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | thaty@gruporaca.com.br | Thaty | **ADMIN** | Todas (*) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 3 | lara@gruporaca.com.br | Lara | **ADMIN** | Todas (*) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 4 | anabeatriz@gruporaca.com.br | Ana Beatriz | **ADMIN** | Todas (*) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 5 | ariane@gruporaca.com.br | Ariane Andrade | **ADMIN** | Todas (*) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 6 | larissa@gruporaca.com.br | Larissa Mendes | **VIEWER** | Todas (*) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 7 | luiz@gruporaca.com.br | Luiz | **VIEWER** | Todas (*) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| 8 | larissa@gruporaca.com.br | Larissa Mendes | **USER** | leiloes | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 9 | deolhonomarchador@gruporaca.com.br | De Olho no Marchador | **USER** | deolhonomarchador | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 10 | topmarchador@gruporaca.com.br | Top Marchador | **USER** | topmarchador | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 11 | arquitemraca@gruporaca.com.br | Arquitetem Raça | **USER** | arquitemraca | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 12 | racaemarcha@gruporaca.com.br | Raça e Marcha | **USER** | racaemarcha | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 13 | portalmarchador@gruporaca.com.br | Portal Marchador | **USER** | portalmarchador | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 14 | puramarcha@gruporaca.com.br | Pura Marcha | **USER** | puramarcha | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 15 | campolina@gruporaca.com.br | Campolina | **USER** | campolina | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📋 Descrição dos Perfis

### 🔴 **ROOT** (Super Administrador)
- **Acesso:** Todas as pastas do sistema
- **Permissões Completas:**
  - ✅ Upload de arquivos
  - ✅ Download de arquivos
  - ✅ Deletar arquivos e pastas
  - ✅ Ver todas as pastas
  - ✅ Gerenciar usuários (criar, editar, deletar)
  - ✅ Gerenciar permissões de outros usuários
- **Usuários:** 1 (Marcus Lopes)

### 🟠 **ADMIN** (Administrador)
- **Acesso:** Todas as pastas do sistema
- **Permissões:**
  - ✅ Upload de arquivos
  - ✅ Download de arquivos
  - ✅ Deletar arquivos e pastas
  - ✅ Ver todas as pastas
  - ❌ Gerenciar usuários
  - ❌ Gerenciar permissões
- **Usuários:** 4 (Thaty, Lara, Ana Beatriz, Ariane Andrade)

### 🟡 **VIEWER** (Visualizador)
- **Acesso:** Todas as pastas do sistema
- **Permissões:**
  - ✅ Upload de arquivos
  - ✅ Download de arquivos
  - ❌ Deletar arquivos e pastas
  - ✅ Ver todas as pastas
  - ❌ Gerenciar usuários
  - ❌ Gerenciar permissões
- **Usuários:** 2 (Larissa Mendes, Luiz)
- **Nota:** Pode ver e baixar de todas as pastas, mas não pode deletar

### 🟢 **USER** (Usuário Padrão)
- **Acesso:** Apenas sua pasta específica
- **Permissões:**
  - ✅ Upload de arquivos (apenas na sua pasta)
  - ✅ Download de arquivos (apenas da sua pasta)
  - ❌ Deletar arquivos e pastas
  - ❌ Ver outras pastas
  - ❌ Gerenciar usuários
  - ❌ Gerenciar permissões
- **Usuários:** 8 (Larissa Mendes, De Olho no Marchador, Top Marchador, Arquitetem Raça, Raça e Marcha, Portal Marchador, Pura Marcha, Campolina)

---

## 📁 Mapeamento de Pastas por Usuário

| Pasta | Usuário | Email |
|-------|---------|-------|
| leiloes | Larissa Mendes | larissa@gruporaca.com.br |
| deolhonomarchador | De Olho no Marchador | deolhonomarchador@gruporaca.com.br |
| topmarchador | Top Marchador | topmarchador@gruporaca.com.br |
| arquitemraca | Arquitetem Raça | arquitemraca@gruporaca.com.br |
| racaemarcha | Raça e Marcha | racaemarcha@gruporaca.com.br |
| portalmarchador | Portal Marchador | portalmarchador@gruporaca.com.br |
| puramarcha | Pura Marcha | puramarcha@gruporaca.com.br |
| campolina | Campolina | campolina@gruporaca.com.br |

---

## 🔐 Resumo de Permissões por Perfil

| Permissão | ROOT | ADMIN | VIEWER | USER |
|-----------|:----:|:-----:|:------:|:----:|
| Upload | ✅ | ✅ | ✅ | ✅* |
| Download | ✅ | ✅ | ✅ | ✅* |
| Deletar | ✅ | ✅ | ❌ | ❌ |
| Ver Todas Pastas | ✅ | ✅ | ✅ | ❌ |
| Gerenciar Usuários | ✅ | ❌ | ❌ | ❌ |
| Gerenciar Permissões | ✅ | ❌ | ❌ | ❌ |

\* *Apenas na sua pasta específica*

---

## 📊 Estatísticas

- **Total de Usuários:** 15
- **ROOT:** 1 usuário
- **ADMIN:** 4 usuários
- **VIEWER:** 2 usuários
- **USER:** 8 usuários
- **Pastas de Usuários:** 8 pastas específicas

---

## ⚠️ Observações Importantes

1. **Larissa Mendes** aparece duas vezes na tabela:
   - Como **VIEWER** (acesso a todas as pastas, sem deletar)
   - Como **USER** (acesso apenas à pasta `leiloes`)
   - ⚠️ Verificar qual perfil está ativo no banco de dados

2. **Pastas em MAIÚSCULAS:** Todas as pastas são criadas e exibidas em letras maiúsculas no sistema.

3. **Acesso ROOT/ADMIN:** Podem ver e gerenciar todas as pastas, mas apenas ROOT pode deletar pastas e gerenciar usuários.

4. **Acesso USER:** Cada usuário vê apenas sua própria pasta e não tem acesso às pastas de outros usuários.

---

*Documento gerado em: 2025*
*Última atualização: Baseado nos scripts SQL do sistema*
