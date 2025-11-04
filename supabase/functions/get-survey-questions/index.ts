// @ts-nocheck
// Public Edge Function - No authentication required
// Gets survey questions for public access

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface Question {
  id: string
  title: string
  type: string
  options: any
  required: boolean
  order_index: number
  created_at: string
}

interface Survey {
  id: string
  title: string
  description: string
  is_active: boolean
  questions?: Question[]
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Use service role key to bypass RLS for public data
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

    // Parse URL parameters
    const url = new URL(req.url)
    const surveyId = url.searchParams.get('survey_id')

    if (surveyId) {
      // Get specific survey with its questions (public access)
      console.log(`Public API: Fetching survey ${surveyId}`)
      
      const { data: survey, error: surveyError } = await supabaseClient
        .from('surveys')
        .select(`
          id,
          title,
          description,
          settings,
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
        .eq('is_active', true)  // Only active surveys for public access
        .single()

      if (surveyError || !survey) {
        return new Response(
          JSON.stringify({ 
            error: 'Survey not found or not active',
            survey_id: surveyId
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Sort questions by order_index
      if (survey.questions) {
        survey.questions.sort((a, b) => a.order_index - b.order_index)
      }

      return new Response(
        JSON.stringify({
          success: true,
          survey: {
            id: survey.id,
            title: survey.title,
            description: survey.description,
            settings: survey.settings,
            questions: survey.questions || []
          },
          question_count: survey.questions?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } else {
      // Get all active public surveys (without questions for performance)
      console.log('Public API: Fetching all active surveys')
      
      const { data: surveys, error: surveysError } = await supabaseClient
        .from('surveys')
        .select(`
          id,
          title,
          description,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (surveysError) {
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch surveys',
            details: surveysError.message 
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
          total_surveys: surveys?.length || 0,
          message: 'Use ?survey_id=<id> to get questions for a specific survey'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

  } catch (error) {
    console.error('Error in public survey function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Please try again later'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})