-- VERIFICAR SE COLUNA metadata EXISTE, SE NÃO EXISTE, CRIAR
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='payments' AND column_name='metadata') THEN
        ALTER TABLE payments ADD COLUMN metadata JSONB;
    END IF;
END $$;
