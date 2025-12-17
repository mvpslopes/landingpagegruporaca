# 📋 Instruções: Criar Usuário ROOT via SQL Manual

## ⚠️ Limitação do MySQL

**MySQL não tem função nativa para gerar hash bcrypt.**  
Por isso, você precisa gerar o hash primeiro e depois colar no SQL.

---

## 📋 Passo a Passo

### **1. Gerar o Hash Bcrypt**

**Opção A - Script PHP (Recomendado):**
1. Acesse: `https://todaarte.com.br/api/gerar-hash-senha.php`
2. Copie o hash gerado

**Opção B - Gerador Online:**
1. Acesse: https://bcrypt-generator.com/
2. Cole a senha: `Gr@up0R@c@2024!M@rcus#Secure`
3. Clique em "Generate Hash"
4. Copie o hash gerado

### **2. Abrir o Arquivo SQL**

Abra o arquivo: `api/criar-usuario-root-SQL-FINAL.sql`

### **3. Substituir o Hash**

Na linha que tem `'HASH_BCRYPT_AQUI'`, substitua pelo hash que você gerou.

**Exemplo:**
```sql
-- ANTES:
'HASH_BCRYPT_AQUI',

-- DEPOIS (com o hash gerado):
'$2y$10$XKqZ8vN9mP2rL5wH3jF6QeY7tB4cD1nA8sM5pR9kL2wH6jF3qB7cD4nA1sM8p',
```

### **4. Executar no phpMyAdmin**

1. Acesse o **phpMyAdmin**
2. Selecione o banco `u179630068_gruporaca_db`
3. Vá na aba **"SQL"**
4. Cole o SQL completo (já com o hash substituído)
5. Clique em **"Executar"** ou **"Go"**

### **5. Verificar**

O script já tem uma query SELECT no final que mostra o usuário criado.

---

## ✅ SQL Completo (Pronto para Copiar)

Depois de gerar o hash, use este SQL:

```sql
INSERT INTO `users` (
    `email`, 
    `password`, 
    `name`, 
    `role`, 
    `folder`, 
    `permissions`,
    `active`
) VALUES (
    'marcus@gruporaca.com.br',
    'HASH_BCRYPT_AQUI', -- ⚠️ SUBSTITUA pelo hash gerado
    'Marcus Lopes',
    'root',
    '*',
    JSON_OBJECT(
        'upload', true,
        'download', true,
        'delete', true,
        'view_all', true,
        'manage_users', true,
        'manage_permissions', true
    ),
    1
) ON DUPLICATE KEY UPDATE 
    `password` = VALUES(`password`),
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `permissions` = VALUES(`permissions`),
    `active` = 1;
```

---

## 🔑 Dados de Login

- **Email:** `marcus@gruporaca.com.br`
- **Senha:** `Gr@up0R@c@2024!M@rcus#Secure`
- **Role:** `root`

---

## 💡 Dica

Se quiser fazer tudo automático sem precisar gerar hash manualmente, use o script PHP:
- `https://todaarte.com.br/api/criar-usuario-root-auto.php`

Ele gera o hash E insere no banco automaticamente!

---

**Pronto!** Gere o hash, cole no SQL e execute! 🚀

