# 🔍 DEBUG DO WEBHOOK

## **PASSO A PASSO PARA VERIFICAR:**

### **1. VER LOGS NO SUPABASE:**

1. Vai em **Edge Functions** → **webhook-cakto**
2. Clica na aba **"Logs"**
3. Vê se apareceu alguma chamada recente
4. Se tiver erro, copia a mensagem

---

### **2. VER SE O CAKTO ESTÁ CHAMANDO:**

No **Cakto Dashboard**:
1. Vai em **Integrações** ou **Webhooks**
2. Procura por **"Histórico"** ou **"Logs"**
3. Vê se tem tentativas de envio
4. Vê o status (sucesso/erro)

---

### **3. POSSÍVEIS PROBLEMAS:**

#### **A) Cakto não enviou webhook:**
- Webhook só dispara para pagamentos com status "paid" ou "approved"
- Alguns métodos de pagamento demoram para confirmar

#### **B) Email diferente:**
- Se você usou email diferente no pagamento, o webhook não vai achar o usuário

#### **C) Erro no webhook:**
- Verificar logs no Supabase

---

### **4. TESTE MANUAL:**

Rodar no terminal:

```bash
curl -X POST https://vzbhjbsywhbziysosrad.supabase.co/functions/v1/webhook-cakto \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_novo_pagamento",
    "status": "paid",
    "customer": {
      "email": "gabriela123@gmail.com"
    },
    "product": {
      "name": "essencial"
    }
  }'
```

Se funcionar, o problema é no Cakto não estar enviando.

---

### **5. ADICIONAR CRÉDITOS MANUALMENTE:**

SQL para adicionar:

**200 créditos (Essencial):**
```sql
UPDATE users SET credits = credits + 200 WHERE email = 'gabriela123@gmail.com';
```

**500 créditos (Profissional):**
```sql
UPDATE users SET credits = credits + 500 WHERE email = 'gabriela123@gmail.com';
```

**1000 créditos (Escala):**
```sql
UPDATE users SET credits = credits + 1000 WHERE email = 'gabriela123@gmail.com';
```
