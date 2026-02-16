# 🎯 CONFIGURAR WEBHOOK CAKTO (Liberação Automática de Créditos)

## ⚠️ IMPORTANTE: FAÇA ISSO ANTES DE TESTAR PAGAMENTO!

---

## 📋 PASSO A PASSO

### **1️⃣ CRIAR TABELA DE PAGAMENTOS NO SUPABASE**

1. Vai em **Supabase Dashboard**
2. Vai em **SQL Editor**
3. Copia e cola todo o conteúdo do arquivo: `supabase-webhook.sql`
4. Clica em **Run**

✅ Isso cria a tabela `payments` para evitar créditos duplicados.

---

### **2️⃣ CRIAR EDGE FUNCTION NO SUPABASE**

#### **Opção A: Via Dashboard (MAIS FÁCIL)**

1. Vai em **Supabase Dashboard** → **Edge Functions**
2. Clica em **Create a new function**
3. Nome: `webhook-cakto`
4. Copia **TODO O CÓDIGO** do arquivo `webhook-cakto-function.ts`
5. Cola no editor e clica em **Deploy**

#### **Opção B: Via CLI (se souber usar)**

```bash
supabase functions deploy webhook-cakto --project-ref vzbhjbsywhbziysosrad
```

---

### **3️⃣ PEGAR URL DO WEBHOOK**

Após criar a função, você vai ter uma URL tipo:

```
https://vzbhjbsywhbziysosrad.supabase.co/functions/v1/webhook-cakto
```

**COPIA ESSA URL!** Você vai precisar dela no próximo passo.

---

### **4️⃣ CONFIGURAR NO CAKTO**

1. Loga no **Cakto Dashboard**
2. Vai nas configurações dos produtos (Essencial, Profissional, Escala)
3. Procura por **"Webhook URL"** ou **"Notificação de Pagamento"**
4. Cola a URL: `https://vzbhjbsywhbziysosrad.supabase.co/functions/v1/webhook-cakto`
5. Salva

**IMPORTANTE:** Configure o webhook para disparar quando o status for:
- `paid` ✅
- `approved` ✅

---

### **5️⃣ TESTAR SEM PAGAR (TESTE MANUAL)**

Você pode testar o webhook **SEM PAGAR DE VERDADE** usando o terminal:

```bash
curl -X POST https://vzbhjbsywhbziysosrad.supabase.co/functions/v1/webhook-cakto \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_123456",
    "status": "paid",
    "customer": {
      "email": "bartolomeugiliade@gmail.com"
    },
    "product": {
      "name": "profissional"
    }
  }'
```

**Troca o email** para o email da sua conta de teste!

Isso vai adicionar **500 créditos** (plano Profissional) sem você precisar pagar.

---

## 🧪 COMO TESTAR O FLUXO COMPLETO

### **Teste 1: Webhook Manual (SEM PAGAR)**

1. Cria uma conta nova no sistema com email de teste
2. Verifica que tem 2 créditos
3. Roda o comando `curl` acima (trocando o email)
4. Recarrega a página e vê se os créditos aumentaram

### **Teste 2: Pagamento Real**

1. Cria conta nova
2. Usa os 2 créditos grátis
3. Clica em "Comprar Créditos"
4. Completa o pagamento no Cakto
5. **ESPERA ATÉ 2 MINUTOS** (webhook pode demorar)
6. Clica em "Já paguei, atualizar saldo"
7. Créditos devem aparecer automaticamente

---

## 🔍 DEBUGGING

### **Ver logs do webhook:**

1. Supabase Dashboard → Edge Functions → webhook-cakto → **Logs**
2. Você vai ver cada chamada que chega e os erros

### **Webhook não funciona?**

Verifica:
- ✅ Tabela `payments` foi criada?
- ✅ Edge Function foi deployada?
- ✅ URL está configurada no Cakto?
- ✅ Email do pagamento é o mesmo da conta?

---

## 📊 MAPAS DE CRÉDITOS

O webhook reconhece esses nomes de planos:

| Nome do Plano      | Créditos |
|--------------------|----------|
| `essencial`        | 200      |
| `profissional`     | 500      |
| `pro`              | 500      |
| `escala`           | 1000     |
| Qualquer outro     | 200      |

---

## ⚠️ IMPORTANTE

- O webhook **previne duplicatas** automaticamente
- Se o mesmo `payment_id` chegar 2x, só processa 1x
- Logs ficam salvos na tabela `payments`

---

**Qualquer dúvida, me chama!** 🚀
