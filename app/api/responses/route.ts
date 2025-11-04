import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// POST - Submit a form response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { form_id, user_id, answers } = body

    // Validate required fields
    if (!form_id || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: form_id and answers are required' },
        { status: 400 }
      )
    }

    // Validate that form exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, is_active')
      .eq('id', form_id)
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    if (!form.is_active) {
      return NextResponse.json(
        { error: 'Form is not active' },
        { status: 400 }
      )
    }

    // Insert the response
    const { data: response, error: insertError } = await supabase
      .from('responses')
      .insert({
        form_id,
        user_id: user_id || null, // Allow null for anonymous submissions
        answers,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to submit response', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      response_id: response.id,
      submitted_at: response.submitted_at,
      message: 'Response submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Retrieve form responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const formId = searchParams.get('form_id')
    const userId = searchParams.get('user_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query with filters
    let query = supabase
      .from('responses')
      .select(`
        id,
        form_id,
        user_id,
        answers,
        submitted_at
      `, { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(from, to)

    // Apply filters
    if (formId) {
      query = query.eq('form_id', formId)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: responses, error: responsesError, count } = await query

    if (responsesError) {
      return NextResponse.json(
        { error: 'Failed to fetch responses', details: responsesError.message },
        { status: 500 }
      )
    }

    // Calculate pagination info
    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    const response = {
      responses: responses || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      filters: {
        form_id: formId,
        user_id: userId
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}