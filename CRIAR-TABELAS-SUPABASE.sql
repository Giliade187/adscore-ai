-- ========================================
-- CRIAR TODAS AS TABELAS - ADSCORE AI
-- COPIE E COLE ISSO NO SUPABASE SQL EDITOR
-- ========================================

-- Limpar políticas antigas
DROP POLICY IF EXISTS "Users podem criar auditorias" ON audits;
DROP POLICY IF EXISTS "Users podem ver auditorias" ON audits;
DROP POLICY IF EXISTS "Users podem criar conta" ON users;
DROP POLICY IF EXISTS "Users podem ver dados" ON users;
DROP POLICY IF EXISTS "Users podem atualizar" ON users;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  credits INTEGER DEFAULT 2,
  total_analyses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de auditorias
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  objective TEXT NOT NULL,
  tipo TEXT NOT NULL,
  score_geral INTEGER NOT NULL,
  zona_decisao JSONB NOT NULL,
  scores_por_criterio JSONB NOT NULL,
  diagnostico_perda_dinheiro JSONB NOT NULL,
  plano_melhorias_praticas JSONB NOT NULL,
  nova_versao_sugerida JSONB NOT NULL,
  ganchos_extras JSONB,
  ctas_extras JSONB,
  simulador_performance JSONB NOT NULL,
  mapa_atencao_simulado JSONB NOT NULL,
  checklist_vencedor JSONB NOT NULL,
  video_frames JSONB,
  termometro JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users podem criar conta" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users podem ver dados" ON users FOR SELECT USING (true);
CREATE POLICY "Users podem atualizar" ON users FOR UPDATE USING (true);
CREATE POLICY "Users podem ver auditorias" ON audits FOR SELECT USING (true);
CREATE POLICY "Users podem criar auditorias" ON audits FOR INSERT WITH CHECK (true);

-- Criar seu usuário admin com créditos infinitos
INSERT INTO users (email, name, password, credits, total_analyses)
VALUES ('bartolomeugiliade@gmail.com', 'Administrador', 'admin123', 999999, 0)
ON CONFLICT (email) DO NOTHING;
