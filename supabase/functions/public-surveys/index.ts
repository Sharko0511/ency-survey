// @ts-nocheck
// Completely public survey API - no authentication required
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
  console.log(`${req.method} ${req.url}`)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Only GET method allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Try with service role first for maximum compatibility
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const url = new URL(req.url)
    const surveyId = url.searchParams.get('survey_id')
    
    if (surveyId) {
      console.log(`Fetching survey: ${surveyId}`)
      
      // Get survey
      const { data: survey, error: surveyError } = await supabaseClient
        .from('surveys')
        .select('id, title, description, settings, is_active')
        .eq('id', surveyId)
        .eq('is_active', true)
        .single()

      if (surveyError || !survey) {
        console.log('Survey error:', surveyError?.message)
        return new Response(
          JSON.stringify({ 
            error: 'Survey not found',
            survey_id: surveyId,
            debug: surveyError?.message
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Get questions separately
      const { data: questions, error: questionsError } = await supabaseClient
        .from('questions')
        .select('id, title, type, options, required, order_index')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true })

      if (questionsError) {
        console.log('Questions error:', questionsError?.message)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch questions',
            debug: questionsError?.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          survey: {
            ...survey,
            questions: questions || []
          },
          question_count: questions?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } else {
      console.log('Fetching all surveys')
      
      const { data: surveys, error: surveysError } = await supabaseClient
        .from('surveys')
        .select('id, title, description, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (surveysError) {
        console.log('Surveys error:', surveysError?.message)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch surveys',
            debug: surveysError?.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          surveys: surveys || [],
          total: surveys?.length || 0,
          message: 'Add ?survey_id=<id> to get questions'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        debug: error?.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})