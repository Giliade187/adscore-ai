#!/bin/bash

# TESTE DO WEBHOOK SEM PAGAR
# Execute: bash testar-webhook.sh

echo "🧪 TESTANDO WEBHOOK CAKTO..."
echo ""
echo "⚠️  IMPORTANTE: Troque o email abaixo para o email da sua conta de teste!"
echo ""

# TROQUE AQUI O EMAIL E A URL
EMAIL="bartolomeugiliade@gmail.com"
WEBHOOK_URL="https://vzbhjbsywhbziysosrad.supabase.co/functions/v1/webhook-cakto"

echo "📧 Email: $EMAIL"
echo "🔗 URL: $WEBHOOK_URL"
echo ""

# Teste 1: Plano Essencial (200 créditos)
echo "📦 Testando: Plano ESSENCIAL (200 créditos)..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"test_essencial_$(date +%s)\",
    \"status\": \"paid\",
    \"customer\": {
      \"email\": \"$EMAIL\"
    },
    \"product\": {
      \"name\": \"essencial\"
    }
  }"

echo ""
echo ""
echo "✅ TESTE CONCLUÍDO!"
echo ""
echo "Agora:"
echo "1. Vai no sistema (localhost:3000)"
echo "2. Faz login com o email: $EMAIL"
echo "3. Verifica se os créditos aumentaram"
echo ""
echo "Se funcionou, pode fazer pagamento real que vai funcionar! 🚀"
