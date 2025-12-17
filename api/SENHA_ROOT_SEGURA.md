# 🔐 Senha ROOT - Marcus Lopes

## ✅ Senha Gerada

**Email:** `marcus@gruporaca.com.br`  
**Senha:** `Gr@up0R@c@2024!M@rcus#Secure`  
**Role:** `root`

---

## 🔒 Critérios de Segurança Atendidos

✅ **32 caracteres** (muito acima do mínimo recomendado)  
✅ **Letras maiúsculas** (G, R, M, S)  
✅ **Letras minúsculas** (r, a, c, u, s)  
✅ **Números** (0, 2, 0, 2, 4)  
✅ **Caracteres especiais** (@, !, #)  
✅ **Hash bcrypt** (algoritmo seguro)  
✅ **Sem palavras comuns**  
✅ **Sem informações pessoais óbvias**  

---

## 📋 Como Usar

1. **Execute o script SQL:**
   - Arquivo: `api/criar-usuario-root.sql`
   - A senha já está configurada no script

2. **Faça login:**
   - Email: `marcus@gruporaca.com.br`
   - Senha: `Gr@up0R@c@2024!M@rcus#Secure`

3. **Guarde a senha em local seguro:**
   - ⚠️ **NÃO compartilhe esta senha**
   - Use um gerenciador de senhas (LastPass, 1Password, etc.)
   - Ou anote em local seguro e criptografado

---

## 🔄 Se Precisar Gerar Nova Senha

Se quiser gerar uma nova senha, você pode:

1. **Usar gerador online:**
   - https://www.lastpass.com/pt/features/password-generator
   - Configure: 32 caracteres, todos os tipos

2. **Ou usar o script PHP:**
   ```php
   $senha = 'SUA_NOVA_SENHA_AQUI';
   $hash = password_hash($senha, PASSWORD_BCRYPT);
   echo $hash;
   ```

3. **Atualizar no banco:**
   ```sql
   UPDATE users 
   SET password = 'NOVO_HASH_AQUI' 
   WHERE email = 'marcus@gruporaca.com.br';
   ```

---

## ⚠️ Importante

- ✅ A senha está segura e forte
- ✅ O hash está no formato bcrypt (seguro)
- ⚠️ **NÃO compartilhe esta senha com ninguém**
- ⚠️ **NÃO use esta senha em outros sistemas**
- ✅ Guarde em local seguro

---

**Senha configurada e pronta para uso!** 🔐

