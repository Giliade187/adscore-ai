#!/bin/bash

# DEPLOY AUTOMÁTICO DO ADSCORE AI
# Execute: bash deploy.sh

echo "🚀 INICIANDO DEPLOY DO ADSCORE AI..."
echo ""

# 1. Criar repositório no GitHub (você precisa estar logado)
echo "📦 Passo 1: Criar repositório no GitHub"
echo "Vai abrir o navegador para você criar o repo..."
open "https://github.com/new?name=adscore-ai&description=Sistema+de+Auditoria+de+Criativos+com+IA"

echo ""
echo "⏳ Esperando você criar o repositório..."
echo "Quando criar, pressione ENTER para continuar..."
read

# 2. Adicionar remote e fazer push
echo ""
echo "📤 Passo 2: Enviando código para o GitHub..."
cd ~/Documents/adscore-ai
git remote add origin https://github.com/Giliade187/adscore-ai.git
git branch -M main
git push -u origin main

echo ""
echo "✅ CÓDIGO ENVIADO PARA O GITHUB!"
echo ""
echo "🔗 Repositório: https://github.com/Giliade187/adscore-ai"
echo ""
echo "📋 Próximo passo: DEPLOY NO NETLIFY"
echo ""
echo "1. Vai em: https://app.netlify.com/start"
echo "2. Clica em 'Import from Git'"
echo "3. Seleciona GitHub"
echo "4. Escolhe o repositório: adscore-ai"
echo "5. Build command: npm run build"
echo "6. Publish directory: dist"
echo "7. Adiciona as variáveis de ambiente"
echo "8. Clica em Deploy"
echo ""
echo "🎉 PRONTO!"
