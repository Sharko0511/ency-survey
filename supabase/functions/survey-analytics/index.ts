// @ts-nocheck
// Deno Edge Function - TypeScript errors are expected in VS Code
// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuestionData {
  id: string
  title: string
  type: string
  options?: {
    choices?: string[]
  }
}

interface ResponseData {
  answers: Record<string, unknown>
  submitted_at: string
}

interface QuestionAnalytics {
  question_id: string
  question_title: string
  question_type: string
  total_answers: number
  choice_distribution?: Record<string, number>
  average_rating?: number
  rating_distribution?: Record<string, number>
  boolean_distribution?: Record<string, number>
  text_responses?: number
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { survey_id } = await req.json()

    if (!survey_id) {
      return new Response(
        JSON.stringify({ error: 'Survey ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get survey responses
    const { data: responses, error: responsesError } = await supabaseClient
      .from('responses')
      .select('answers, submitted_at')
      .eq('survey_id', survey_id)

    if (responsesError) {
      throw responsesError
    }

    // Get survey questions for context  
    const { data: questions, error: questionsError } = await supabaseClient
      .from('questions')
      .select('id, title, type, options')
      .eq('survey_id', survey_id)
      .order('order_index', { ascending: true })

    if (questionsError) {
      throw questionsError
    }

    // Calculate analytics
    const totalResponses = (responses as ResponseData[]).length
    const analytics = {
      total_responses: totalResponses,
      questions_analytics: (questions as QuestionData[]).map((question) => {
        const questionAnswers = (responses as ResponseData[])
          .map((r) => r.answers[question.id])
          .filter((answer) => answer !== undefined && answer !== null)

        const questionAnalytics: QuestionAnalytics = {
          question_id: question.id,
          question_title: question.title,
          question_type: question.type,
          total_answers: questionAnswers.length,
        }

        switch (question.type) {
          case 'single_choice':
          case 'multiple_choice':
            const choices = question.options?.choices || []
            const choiceCounts = choices.reduce((acc: Record<string, number>, choice: string) => {
              acc[choice] = 0
              return acc
            }, {})

            questionAnswers.forEach((answer) => {
              if (Array.isArray(answer)) {
                // Multiple choice
                answer.forEach((choice) => {
                  if (typeof choice === 'string' && choiceCounts.hasOwnProperty(choice)) {
                    choiceCounts[choice]++
                  }
                })
              } else if (typeof answer === 'string' && choiceCounts.hasOwnProperty(answer)) {
                // Single choice
                choiceCounts[answer]++
              }
            })

            questionAnalytics.choice_distribution = choiceCounts
            break

          case 'rating':
            const ratings = questionAnswers
              .filter((answer) => typeof answer === 'number')
              .map((answer) => Number(answer))

            if (ratings.length > 0) {
              const sum = ratings.reduce((a: number, b: number) => a + b, 0)
              questionAnalytics.average_rating = sum / ratings.length
              questionAnalytics.rating_distribution = ratings.reduce((acc: Record<string, number>, rating) => {
                const ratingStr = rating.toString()
                acc[ratingStr] = (acc[ratingStr] || 0) + 1
                return acc
              }, {})
            }
            break

          case 'boolean':
            const booleanCounts: Record<string, number> = { 'true': 0, 'false': 0 }
            questionAnswers.forEach((answer) => {
              if (typeof answer === 'boolean') {
                const key = answer.toString() as keyof typeof booleanCounts
                booleanCounts[key]++
              }
            })
            questionAnalytics.boolean_distribution = booleanCounts
            break

          case 'text':
            questionAnalytics.text_responses = questionAnswers.length
            break
        }

        return questionAnalytics
      }),
      submission_timeline: (responses as ResponseData[]).map((r) => ({
        submitted_at: r.submitted_at,
        count: 1
      }))
    }

    return new Response(
      JSON.stringify({ analytics }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in survey-analytics function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})