-- CRIAR TABELA PARA REGISTRAR PAGAMENTOS (evita duplicatas)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'cakto',
  external_payment_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  credits_added INTEGER NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATIVAR RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS
CREATE POLICY "Users podem ver seus pagamentos" ON payments FOR SELECT USING (true);
CREATE POLICY "Webhook pode inserir pagamentos" ON payments FOR INSERT WITH CHECK (true);

-- INDEX para busca rápida
CREATE INDEX IF NOT EXISTS payments_external_id_idx ON payments(external_payment_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
