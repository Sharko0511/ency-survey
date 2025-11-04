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
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const sectionsParam = searchParams.get('sections')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // First, get the form to validate it exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, section_ids')
      .eq('id', id)
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    let targetSectionIds: string[] = form.section_ids || []

    // Option 2: Filter by specific sections if provided
    if (sectionsParam) {
      const requestedSections = sectionsParam.split(',').map(s => s.trim())
      targetSectionIds = targetSectionIds.filter(sectionId => 
        requestedSections.includes(sectionId)
      )
    }

    // Get sections with their questions
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
      .in('section_id', targetSectionIds)

    if (sectionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sections', details: sectionsError.message },
        { status: 500 }
      )
    }

    // Get all question IDs from target sections
    const allQuestionIds = (sections || []).flatMap(section => section.question_ids || [])

    if (allQuestionIds.length === 0) {
      return NextResponse.json({
        questions: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          total_pages: 0
        },
        metadata: {
          form_id: id,
          sections_included: targetSectionIds,
          total_questions: 0
        }
      })
    }

    // Option 3: Apply pagination
    const offset = (page - 1) * limit
    const paginatedQuestionIds = allQuestionIds.slice(offset, offset + limit)

    // Get questions for the paginated question IDs
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
      .in('question_id', paginatedQuestionIds)

    if (questionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: questionsError.message },
        { status: 500 }
      )
    }

    // Preserve the order from section.question_ids
    const orderedQuestions = paginatedQuestionIds
      .map(questionId => questions?.find(q => q.question_id === questionId))
      .filter(Boolean) // Remove undefined questions

    // Calculate pagination info
    const totalQuestions = allQuestionIds.length
    const totalPages = Math.ceil(totalQuestions / limit)

    const response = {
      questions: orderedQuestions,
      pagination: {
        page,
        limit,
        total: totalQuestions,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      metadata: {
        form_id: id,
        sections_included: targetSectionIds,
        sections_requested: sectionsParam ? sectionsParam.split(',').map(s => s.trim()) : null,
        total_questions: totalQuestions,
        query_type: sectionsParam ? 'filtered_sections' : 'all_sections'
      }
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