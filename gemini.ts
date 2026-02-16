const GEMINI_API_KEY = 'AIzaSyDYqCq7_6fiPYVP6mtTj70TE3lNsUHpZms';

// Cache for selected model
let cachedModel: string | null = null;

// Helper to find available model
async function getAvailableModel(): Promise<string> {
  if (cachedModel) {
    return cachedModel;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    if (!response.ok) {
      throw new Error('Failed to list models');
    }

    const data = await response.json();
    const models = data.models || [];

    // Prefer gemini-2.0-flash
    const preferred = models.find((m: any) => 
      m.name === 'models/gemini-2.0-flash' && 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    if (preferred) {
      cachedModel = 'gemini-2.0-flash';
      console.log('✅ Using model: gemini-2.0-flash');
      return cachedModel;
    }

    // Fallback to gemini-1.5-flash variants
    const flashVariant = models.find((m: any) => 
      m.name?.includes('gemini-1.5-flash') && 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    if (flashVariant) {
      cachedModel = flashVariant.name?.replace('models/', '') || 'gemini-1.5-flash-001';
      console.log(`✅ Using model: ${cachedModel}`);
      return cachedModel;
    }

    // Use first model that supports generateContent
    const firstAvailable = models.find((m: any) => 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    if (firstAvailable) {
      cachedModel = firstAvailable.name?.replace('models/', '') || 'gemini-1.5-flash-001';
      console.log(`✅ Using model: ${cachedModel}`);
      return cachedModel;
    }

    throw new Error('No suitable model found');
  } catch (error) {
    console.error('❌ Error listing models, using fallback:', error);
    // Fallback to known working model
    cachedModel = 'gemini-1.5-flash-001';
    return cachedModel;
  }
}

export const analyzeCreative = async (data: { frames: string[], platform: string, objective: string, fileType: 'image'|'video' }): Promise<any> => {
  
  try {
    console.log('🤖 Iniciando análise REAL com Gemini via REST API...');
    
    // Get available model
    const modelName = await getAvailableModel();
    console.log(`🎯 Model selecionado: ${modelName}`);
    
    const prompt = `Você é um auditor EXPERT em criativos de anúncios pagos. Analise este criativo de ${data.platform} para ${data.objective}.

SEJA EXTREMAMENTE ESPECÍFICO - descreva EXATAMENTE o que você VÊ na imagem (cores, texto, elementos, posição).

Retorne APENAS o JSON puro (sem markdown):

{
  "tipo": "${data.fileType}",
  "score_geral": <número 0-100>,
  "zona_decisao": {
    "label": "<Verde/Amarelo/Vermelho>",
    "recomendacao": "<escalar/ajustar/matar>",
    "justificativa_curta": "<2-3 frases ESPECÍFICAS sobre o que você VÊ>"
  },
  "termometro": {
    "min": 0,
    "max": 100,
    "ponteiro": <score>,
    "faixas": [
      { "label": "Crítico", "from": 0, "to": 40 },
      { "label": "Ajustar", "from": 40, "to": 65 },
      { "label": "Bom", "from": 65, "to": 85 },
      { "label": "Excelente", "from": 85, "to": 100 }
    ]
  },
  "scores_por_criterio": [
    {
      "criterio": "Hook Visual",
      "score": <0-100>,
      "porque": "<4-5 frases ESPECÍFICAS do que você VÊ>",
      "correcao": "<2-3 frases de como melhorar>",
      "exemplo_pronto": "<exemplo ESPECÍFICO>"
    },
    {
      "criterio": "Headline/Mensagem",
      "score": <0-100>,
      "porque": "<análise ESPECÍFICA>",
      "correcao": "<melhorias>",
      "exemplo_pronto": "<exemplo>"
    },
    {
      "criterio": "CTA",
      "score": <0-100>,
      "porque": "<análise>",
      "correcao": "<melhorias>",
      "exemplo_pronto": "<exemplo>"
    },
    {
      "criterio": "Produto/Oferta",
      "score": <0-100>,
      "porque": "<análise>",
      "correcao": "<melhorias>",
      "exemplo_pronto": "<exemplo>"
    },
    {
      "criterio": "Prova Social",
      "score": <0-100>,
      "porque": "<análise>",
      "correcao": "<melhorias>",
      "exemplo_pronto": "<exemplo>"
    },
    {
      "criterio": "Urgência",
      "score": <0-100>,
      "porque": "<análise>",
      "correcao": "<melhorias>",
      "exemplo_pronto": "<exemplo>"
    },
    {
      "criterio": "Design/Cores",
      "score": <0-100>,
      "porque": "<análise>",
      "correcao": "<melhorias>",
      "exemplo_pronto": "<exemplo>"
    }
  ],
  "diagnostico_perda_dinheiro": [
    {
      "prioridade": 1,
      "problema": "<problema ESPECÍFICO #1>",
      "impacto_estimado": "<impacto>",
      "acao_pratica": "<ação detalhada>"
    },
    {
      "prioridade": 2,
      "problema": "<problema #2>",
      "impacto_estimado": "<impacto>",
      "acao_pratica": "<ação>"
    },
    {
      "prioridade": 3,
      "problema": "<problema #3>",
      "impacto_estimado": "<impacto>",
      "acao_pratica": "<ação>"
    }
  ],
  "plano_melhorias_praticas": [
    {
      "acao": "<melhoria #1>",
      "tempo_estimado": "<tempo>",
      "como_fazer": "<passo a passo>"
    },
    {
      "acao": "<melhoria #2>",
      "tempo_estimado": "<tempo>",
      "como_fazer": "<passo>"
    },
    {
      "acao": "<melhoria #3>",
      "tempo_estimado": "<tempo>",
      "como_fazer": "<passo>"
    }
  ],
  "nova_versao_sugerida": {
    "headline": "<headline completa>",
    "subheadline": "<subheadline>",
    "script_bullets": ["<bullet 1>", "<bullet 2>", "<bullet 3>"],
    "cta": "<CTA completo>"
  },
  "ganchos_extras": ["<gancho 1>", "<gancho 2>", "<gancho 3>", "<gancho 4>", "<gancho 5>"],
  "ctas_extras": ["<cta 1>", "<cta 2>", "<cta 3>", "<cta 4>", "<cta 5>"],
  "simulador_performance": {
    "potencial_ctr": "<baixo/medio/alto>",
    "risco_ignorar": "<baixo/medio/alto>",
    "potencial_escala": "<baixo/medio/alto>",
    "explicacao": "<5-7 frases>"
  },
  "mapa_atencao_simulado": {
    "primeiro_olhar": "<onde o olho vai primeiro - 3-4 frases>",
    "segundo_olhar": "<segundo ponto - 3-4 frases>",
    "terceiro_olhar": "<terceiro ponto - 3-4 frases>",
    "problema_atencao": "<problemas - 3-4 frases>"
  },
  "checklist_vencedor": [
    { "item": "Hook visual", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" },
    { "item": "Produto visível", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" },
    { "item": "CTA destacado", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" },
    { "item": "Headline clara", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" },
    { "item": "Prova social", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" },
    { "item": "Urgência", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" },
    { "item": "Contraste", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" },
    { "item": "Design profissional", "status": "<ok/alerta/falha>", "detalhe": "<comentário>" }
  ],
  "video_frames": []
}`;

    // Usar API REST do Gemini com modelo detectado
    const base64Data = data.frames[0].split(',')[1];
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro na API Gemini:', errorData);
      throw new Error(`Gemini API Error (${response.status}): ${errorData.error?.message || 'Request failed'}`);
    }

    const result = await response.json();
    console.log('📄 Resposta da API recebida');
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    
    console.log('📝 Texto extraído (primeiros 500 chars):', text.substring(0, 500));
    
    // Limpar e parsear JSON
    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '')
      .replace(/[^}]*$/, '')
      .trim();
    
    const analysis = JSON.parse(jsonText);
    console.log('✅ Análise parseada! Score:', analysis.score_geral);
    
    return analysis;
    
  } catch (error: any) {
    console.error('❌ Erro na análise Gemini:', error.message);
    
    // Re-throw error to propagate failure (don't consume credit on failure)
    throw error;
  }
};
