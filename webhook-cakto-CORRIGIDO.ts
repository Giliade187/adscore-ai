// EDGE FUNCTION CORRIGIDA - SEM AUTENTICAÇÃO OBRIGATÓRIA
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Usar SERVICE_ROLE_KEY para bypass de RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente não configuradas')
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const payload = await req.json()
    console.log('📥 Webhook recebido:', JSON.stringify(payload, null, 2))

    if (payload.status !== 'paid' && payload.status !== 'approved') {
      console.log('⚠️ Status não é "paid" ou "approved", ignorando')
      return new Response(JSON.stringify({ ok: true, message: 'Status ignorado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const externalPaymentId = payload.id || payload.payment_id || payload.transaction_id
    const customerEmail = payload.customer?.email || payload.email
    const productId = payload.product?.id || payload.product_id
    const planName = payload.product?.name || payload.plan || productId

    console.log('📊 Dados extraídos:', { externalPaymentId, customerEmail, planName })

    if (!externalPaymentId || !customerEmail) {
      throw new Error('Dados incompletos no webhook')
    }

    const creditsMap: Record<string, number> = {
      'essencial': 200,
      'profissional': 500,
      'pro': 500,
      'escala': 1000,
    }

    const planKey = planName?.toLowerCase() || ''
    const creditsToAdd = creditsMap[planKey] || 200

    console.log('💳 Créditos a adicionar:', creditsToAdd)

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (userError || !user) {
      console.error('Erro ao buscar usuário:', userError)
      throw new Error(`Usuário não encontrado: ${customerEmail}`)
    }

    console.log('👤 Usuário encontrado:', user.id)

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('external_payment_id', externalPaymentId)
      .maybeSingle()

    if (existingPayment) {
      console.log('⚠️ Pagamento já processado anteriormente')
      return new Response(JSON.stringify({ ok: true, message: 'Já processado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

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
      console.error('Erro ao registrar pagamento:', paymentError)
      throw new Error(`Erro ao registrar pagamento: ${paymentError.message}`)
    }

    console.log('💾 Pagamento registrado')

    const newBalance = user.credits + creditsToAdd
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newBalance })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar créditos:', updateError)
      throw new Error(`Erro ao atualizar créditos: ${updateError.message}`)
    }

    console.log(`✅ Créditos adicionados! ${user.credits} -> ${newBalance}`)

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: 'Créditos liberados com sucesso',
        user: customerEmail,
        credits_added: creditsToAdd,
        new_balance: newBalance
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('❌ Erro no webhook:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || 'Erro desconhecido',
        details: error.toString()
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
