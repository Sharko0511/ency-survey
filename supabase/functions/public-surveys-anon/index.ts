// @ts-nocheck
// Public survey API using anonymous key with proper RLS policies
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
    // Use anonymous key for public access (requires proper RLS policies)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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
      
      // Get survey with questions in a single query
      const { data: survey, error: surveyError } = await supabaseClient
        .from('surveys')
        .select(`
          id,
          title,
          description,
          settings,
          is_active,
          created_at,
          questions (
            id,
            title,
            type,
            options,
            required,
            order_index
          )
        `)
        .eq('id', surveyId)
        .eq('is_active', true)
        .single()

      if (surveyError) {
        console.log('Survey error:', surveyError?.message)
        return new Response(
          JSON.stringify({ 
            error: 'Survey not found or not accessible',
            survey_id: surveyId,
            debug: surveyError?.message,
            hint: 'Make sure RLS policies are set up correctly'
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!survey) {
        return new Response(
          JSON.stringify({ 
            error: 'Survey not found',
            survey_id: surveyId
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Sort questions by order_index
      const sortedQuestions = (survey.questions || []).sort((a, b) => 
        (a.order_index || 0) - (b.order_index || 0)
      )

      return new Response(
        JSON.stringify({
          success: true,
          survey: {
            ...survey,
            questions: sortedQuestions,
            question_count: sortedQuestions.length
          }
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
        .select('id, title, description, created_at, settings')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (surveysError) {
        console.log('Surveys error:', surveysError?.message)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch surveys',
            debug: surveysError?.message,
            hint: 'Check RLS policies on surveys table'
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
          message: 'Add ?survey_id=<id> to get questions',
          available_surveys: surveys?.map(s => s.id) || []
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
        debug: error?.message || 'Unknown error',
        hint: 'Check function logs and RLS policies'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})