# 👤 Criar Usuário ROOT - Marcus Lopes

## 🎯 Objetivo

Criar apenas o usuário ROOT primeiro, para poder testar a funcionalidade de criar outros usuários através do sistema.

---

## 📋 Passo a Passo

### **1. Executar o Script SQL**

1. Acesse o **phpMyAdmin**
2. Selecione o banco `u179630068_gruporaca_db`
3. Vá na aba **"SQL"**
4. Copie e cole o conteúdo do arquivo `api/criar-usuario-root.sql`
5. Clique em **"Executar"** ou **"Go"**

### **2. Verificar se Foi Criado**

Após executar, você deve ver:
- ✅ Mensagem de sucesso
- ✅ 1 linha inserida
- ✅ Resultado da query SELECT mostrando o usuário criado

### **3. Dados de Login**

**Email:** `marcus@gruporaca.com.br`  
**Senha:** `password`  
**Role:** `root`

---

## ✅ Validação

Execute esta query para verificar:

```sql
SELECT 
    id,
    email,
    name,
    role,
    folder,
    active,
    created_at
FROM users 
WHERE email = 'marcus@gruporaca.com.br';
```

**Resultado esperado:**
- ✅ 1 usuário encontrado
- ✅ Role = `root`
- ✅ Folder = `*`
- ✅ Active = `1`

---

## 🚀 Próximos Passos

Após criar o usuário ROOT:

1. **Fazer login no sistema:**
   - Acesse a página do Banco de Dados
   - Entre com: `marcus@gruporaca.com.br` / `password`

2. **Testar criação de usuários:**
   - Clique em **"Gerenciar Usuários"** (botão azul)
   - Clique em **"Novo Usuário"**
   - Crie os demais usuários (ADMIN e USER)

3. **Alterar senha:**
   - ⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro login!

---

## 🔒 Segurança

- ✅ Senha está com hash bcrypt (seguro)
- ✅ Usuário ROOT tem todas as permissões
- ⚠️ Altere a senha padrão `password` após o primeiro login

---

## 📝 Notas

- O script usa `ON DUPLICATE KEY UPDATE` - se o usuário já existir, apenas atualiza
- A senha padrão é `password` (hash bcrypt)
- O campo `created_by` será NULL (pois é o primeiro usuário)
- O campo `folder` com valor `*` significa acesso a todas as pastas

---

**Pronto!** Execute o script e me informe se funcionou! 🎯

