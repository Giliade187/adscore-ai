// EDGE FUNCTION DO SUPABASE PARA WEBHOOK CAKTO
// Deploy: Supabase Dashboard > Edge Functions > Create new function
// Nome: webhook-cakto
// Cole esse código

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('📥 Webhook recebido:', JSON.stringify(payload, null, 2))

    // Verificar se é pagamento aprovado
    if (payload.status !== 'paid' && payload.status !== 'approved') {
      console.log('⚠️ Status não é "paid" ou "approved", ignorando')
      return new Response(JSON.stringify({ ok: true, message: 'Status ignorado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extrair dados do pagamento
    const externalPaymentId = payload.id || payload.payment_id || payload.transaction_id
    const customerEmail = payload.customer?.email || payload.email
    const productId = payload.product?.id || payload.product_id
    const planName = payload.product?.name || payload.plan || productId

    console.log('📊 Dados extraídos:', { externalPaymentId, customerEmail, planName })

    if (!externalPaymentId || !customerEmail) {
      throw new Error('Dados incompletos no webhook')
    }

    // Mapear plano -> créditos
    const creditsMap: Record<string, number> = {
      'essencial': 200,
      'profissional': 500,
      'pro': 500,
      'escala': 1000,
    }

    const planKey = planName?.toLowerCase() || ''
    const creditsToAdd = creditsMap[planKey] || 200 // default 200

    console.log('💳 Créditos a adicionar:', creditsToAdd)

    // Buscar usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (userError || !user) {
      throw new Error(`Usuário não encontrado: ${customerEmail}`)
    }

    console.log('👤 Usuário encontrado:', user.id)

    // Verificar se pagamento já foi processado (idempotência)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('external_payment_id', externalPaymentId)
      .single()

    if (existingPayment) {
      console.log('⚠️ Pagamento já processado anteriormente')
      return new Response(JSON.stringify({ ok: true, message: 'Já processado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Registrar pagamento
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: user.id,
      provider: 'cakto',
      external_payment_id: externalPaymentId,
      plan: planName || 'desconhecido',
      credits_added: creditsToAdd,
      status: 'paid',
      metadata: payload,
    })

    if (paymentError) {
      throw new Error(`Erro ao registrar pagamento: ${paymentError.message}`)
    }

    console.log('💾 Pagamento registrado')

    // Adicionar créditos ao usuário
    const newBalance = user.credits + creditsToAdd
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newBalance })
      .eq('id', user.id)

    if (updateError) {
      throw new Error(`Erro ao atualizar créditos: ${updateError.message}`)
    }

    console.log(`✅ Créditos adicionados! ${user.credits} -> ${newBalance}`)

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: 'Créditos liberados',
        user: customerEmail,
        credits_added: creditsToAdd,
        new_balance: newBalance
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
