/**
 * Populate Database with Vietnamese Fitness Form Data
 * 
 * This script reads the questionaire.json file and populates the Supabase database
 * with the form, sections, and questions data using the modular schema structure.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Read the questionnaire data
const questionnaireData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'questionaire.json'), 'utf-8')
)

async function populateDatabase() {
  console.log('🚀 Starting database population...')

  try {
    // Step 1: Insert Form
    console.log('📋 Inserting form...')

    const sectionIds = questionnaireData.sections.map(section => section.sectionId)

    const formData = {
      id: 'fitness-form-v1',
      title: questionnaireData.formTitle,
      description: questionnaireData.formDescription,
      section_ids: sectionIds,
      is_active: true,
      settings: {
        submitButtonText: questionnaireData.submitButtonText,
        successMessage: questionnaireData.successMessage
      }
    }

    const { error: formError } = await supabase
      .from('forms')
      .insert(formData)

    if (formError) {
      console.error('Error inserting form:', formError)
      return
    }

    console.log('✅ Form inserted successfully')

    // Step 2: Insert Sections
    console.log('📑 Inserting sections...')

    const sectionsData = questionnaireData.sections.map(section => ({
      section_id: section.sectionId,
      title: section.title,
      description: section.description,
      question_ids: section.questions.map(q => q.id),
      category: getCategoryFromSection(section.sectionId),
      tags: getTagsFromSection(section.sectionId)
    }))

    const { error: sectionsError } = await supabase
      .from('sections')
      .insert(sectionsData)

    if (sectionsError) {
      console.error('Error inserting sections:', sectionsError)
      return
    }

    console.log('✅ Sections inserted successfully')

    // Step 3: Insert Questions
    console.log('❓ Inserting questions...')

    const questionsData = []

    for (const section of questionnaireData.sections) {
      for (const question of section.questions) {
        const questionData = {
          question_id: question.id,
          type: question.type,
          label: question.label,
          description: question.description || null,
          options: question.options ? { choices: question.options } : null,
          validation: buildValidation(question),
          conditional: question.conditional || null
        }

        questionsData.push(questionData)
      }
    }

    // Insert questions in batches of 50 to avoid payload limits
    const batchSize = 50
    for (let i = 0; i < questionsData.length; i += batchSize) {
      const batch = questionsData.slice(i, i + batchSize)

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(batch)

      if (questionsError) {
        console.error(`Error inserting questions batch ${i / batchSize + 1}:`, questionsError)
        return
      }

      console.log(`✅ Questions batch ${i / batchSize + 1} inserted (${batch.length} questions)`)
    }

    // Step 4: Verify insertion
    console.log('🔍 Verifying data insertion...')

    const { data: formsCount } = await supabase
      .from('forms')
      .select('id', { count: 'exact' })
      .eq('id', 'fitness-form-v1')

    const { data: sectionsCount } = await supabase
      .from('sections')
      .select('section_id', { count: 'exact' })

    const { data: questionsCount } = await supabase
      .from('questions')
      .select('question_id', { count: 'exact' })

    console.log('📊 Data Summary:')
    console.log(`   Forms: ${formsCount?.length || 0}`)
    console.log(`   Sections: ${sectionsCount?.length || 0}`)
    console.log(`   Questions: ${questionsCount?.length || 0}`)

    console.log('🎉 Database population completed successfully!')

  } catch (error) {
    console.error('❌ Error during database population:', error)
  }
}

// Helper Functions
function getCategoryFromSection(sectionId) {
  const categoryMap = {
    'basic_info': 'personal_info',
    'body_metrics': 'body_metrics',
    'medical_health': 'health',
    'lifestyle': 'lifestyle',
    'nutrition': 'nutrition',
    'training_history': 'training',
    'training_goals': 'goals',
    'preferences_schedule': 'preferences',
    'motivation_coaching': 'coaching',
    'commitment': 'legal'
  }

  return categoryMap[sectionId] || 'general'
}

function getTagsFromSection(sectionId) {
  const tagsMap = {
    'basic_info': ['basic', 'required', 'personal'],
    'body_metrics': ['body', 'measurements', 'fitness'],
    'medical_health': ['health', 'medical', 'safety'],
    'lifestyle': ['lifestyle', 'habits', 'daily'],
    'nutrition': ['nutrition', 'diet', 'food'],
    'training_history': ['training', 'history', 'experience'],
    'training_goals': ['goals', 'objectives', 'targets'],
    'preferences_schedule': ['preferences', 'schedule', 'availability'],
    'motivation_coaching': ['motivation', 'coaching', 'support'],
    'commitment': ['agreement', 'commitment', 'legal']
  }

  return tagsMap[sectionId] || ['general']
}

function buildValidation(question) {
  const validation = {}

  if (question.required) {
    validation.required = true
  }

  if (question.validation) {
    Object.assign(validation, question.validation)
  }

  return Object.keys(validation).length > 0 ? validation : null
}

// Run the population script
if (import.meta.url === `file://${process.argv[1]}`) {
  populateDatabase()
}

export { populateDatabase }