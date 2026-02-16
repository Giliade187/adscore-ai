-- ADICIONAR 200 CRÉDITOS MANUALMENTE PARA O PAGAMENTO
UPDATE users 
SET credits = credits + 200 
WHERE email = 'bartolomeugiliade@gmail.com';

-- REGISTRAR O PAGAMENTO PARA NÃO DUPLICAR
INSERT INTO payments (user_id, provider, external_payment_id, plan, credits_added, status)
SELECT id, 'cakto', 'manual_essencial_' || EXTRACT(EPOCH FROM NOW()), 'essencial', 200, 'paid'
FROM users WHERE email = 'bartolomeugiliade@gmail.com';
