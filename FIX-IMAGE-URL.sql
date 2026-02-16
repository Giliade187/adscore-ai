-- AUMENTAR LIMITE DA COLUNA image_url PARA ACEITAR BASE64 GRANDE
-- Execute isso no SQL Editor do Supabase

ALTER TABLE audits ALTER COLUMN image_url TYPE TEXT;
