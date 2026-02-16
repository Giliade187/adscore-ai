# 🚀 AdScore AI - Auditoria Inteligente de Criativos

Sistema completo de análise e auditoria de criativos publicitários usando Inteligência Artificial.

## ✨ Funcionalidades

- 🤖 **Análise com IA** - Integração com Gemini API para análise visual detalhada
- 💳 **Sistema de Créditos** - 2 créditos grátis + planos pagos (Essencial, Profissional, Escala)
- 🔄 **Webhook Automático** - Liberação automática de créditos via Cakto
- 📊 **Dashboard Completo** - KPIs, histórico e estatísticas de auditorias
- 🎨 **Interface Moderna** - React 19 + Tailwind CSS + Design responsivo
- 🔐 **Auth & Database** - Supabase para autenticação e armazenamento

## 🛠️ Tecnologias

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **IA:** Google Gemini API
- **Pagamentos:** Cakto + Webhook
- **Deploy:** Vercel

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/adscore-ai.git
cd adscore-ai

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Rode o servidor de desenvolvimento
npm run dev
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
GEMINI_API_KEY=sua_chave_gemini
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_supabase
CAKTO_LINK_ESSENCIAL=link_checkout_essencial
CAKTO_LINK_PRO=link_checkout_profissional
CAKTO_LINK_ESCALA=link_checkout_escala
CAKTO_WEBHOOK_SECRET=seu_secret
```

## 🗄️ Configuração do Banco de Dados

Execute os scripts SQL na ordem:

1. `CRIAR-TABELAS-SUPABASE.sql` - Cria tabelas users e audits
2. `supabase-webhook.sql` - Cria tabela payments e RLS

## 🔄 Configuração do Webhook

Siga as instruções em `CONFIGURAR-WEBHOOK.md` para configurar a liberação automática de créditos.

## 📋 Planos

- **Essencial** - R$47 - 200 créditos
- **Profissional** - R$67 - 500 créditos  
- **Escala** - R$137 - 1000 créditos

## 🚀 Deploy

O projeto está configurado para deploy automático na Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/adscore-ai)

## 📄 Licença

MIT

## 👤 Autor

Desenvolvido com ❤️ por [Seu Nome]
