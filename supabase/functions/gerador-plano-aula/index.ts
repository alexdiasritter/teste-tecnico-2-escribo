// supabase/functions/gerador-plano-aula/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@latest'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado.')

    const { tema_aula, ano_escolar, duracao_minutos } = await req.json()
    if (!tema_aula || !ano_escolar) throw new Error('Tema da aula e ano escolar são obrigatórios.')

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    // 1. Usa o nome do modelo correto que você encontrou
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
      Gere um plano de aula criativo e detalhado. O formato da resposta DEVE ser um objeto JSON válido, sem nenhum texto ou formatação adicional.
      Use a seguinte estrutura:
      {
        "introducao_ludica": "...",
        "objetivo_bncc": "...",
        "passo_a_passo": "...",
        "rubrica_avaliacao": "..."
      }

      Use os seguintes dados para gerar o plano:
      - Tema da Aula: ${tema_aula}
      - Ano Escolar: ${ano_escolar}
      - Duração da Aula (minutos): ${duracao_minutos || 50}
    `
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // 2. Extrai o JSON de dentro do bloco de código Markdown
    const jsonStringMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonStringMatch || !jsonStringMatch[1]) {
      // Se a IA não retornar o Markdown, tenta analisar o texto diretamente
      try {
        const planoGerado = JSON.parse(text);
        // Se funcionar, continua o fluxo normal
        // (código duplicado abaixo para clareza)
        const { data: planoSalvo, error: insertError } = await supabaseClient
          .from('planos_de_aula')
          .insert({ user_id: user.id, tema_aula, ano_escolar, duracao_minutos, ...planoGerado })
          .select().single();
        if (insertError) throw new Error(`Erro ao salvar no banco de dados: ${insertError.message}`);
        return new Response(JSON.stringify({ plano: planoSalvo }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

      } catch (e) {
        throw new Error("A resposta da IA não continha um JSON válido.");
      }
    }

    const jsonString = jsonStringMatch[1];
    const planoGerado = JSON.parse(jsonString);

    const { data: planoSalvo, error: insertError } = await supabaseClient
      .from('planos_de_aula')
      .insert({
        user_id: user.id,
        tema_aula,
        ano_escolar,
        duracao_minutos,
        introducao_ludica: planoGerado.introducao_ludica,
        objetivo_bncc: planoGerado.objetivo_bncc,
        passo_a_passo: planoGerado.passo_a_passo,
        rubrica_avaliacao: planoGerado.rubrica_avaliacao,
      })
      .select()
      .single()

    if (insertError) throw new Error(`Erro ao salvar no banco de dados: ${insertError.message}`)

    return new Response(JSON.stringify({ plano: planoSalvo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})