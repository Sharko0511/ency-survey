import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get form with sections and questions
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select(`
        id,
        title,
        description,
        section_ids,
        is_active,
        settings
      `)
      .eq('id', id)
      .single()

    if (formError) {
      return NextResponse.json(
        { error: 'Form not found', details: formError.message },
        { status: 404 }
      )
    }

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    // Get sections for this form
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select(`
        section_id,
        title,
        description,
        question_ids,
        category,
        tags
      `)
      .in('section_id', form.section_ids || [])

    if (sectionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sections', details: sectionsError.message },
        { status: 500 }
      )
    }

    // Get all question IDs from all sections
    const allQuestionIds = (sections || []).flatMap(section => section.question_ids || [])

    // Get questions for all sections
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        question_id,
        type,
        label,
        description,
        options,
        validation
      `)
      .in('question_id', allQuestionIds)

    if (questionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: questionsError.message },
        { status: 500 }
      )
    }

    // Build structured response
    const sectionsWithQuestions = (sections || []).map(section => ({
      ...section,
      questions: (section.question_ids || [])
        .map((questionId: string) => questions?.find(q => q.question_id === questionId))
        .filter(Boolean) // Remove undefined questions
    }))

    // Order sections according to form.section_ids order
    const orderedSections = (form.section_ids || [])
      .map((sectionId: string) => sectionsWithQuestions.find(s => s.section_id === sectionId))
      .filter(Boolean) // Remove undefined sections

    const response = {
      ...form,
      sections: orderedSections,
      total_questions: questions?.length || 0,
      total_sections: orderedSections.length
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add CORS headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}