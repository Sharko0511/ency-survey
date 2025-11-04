import { Database } from '@/types/database'

type Survey = Database['public']['Tables']['surveys']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type Response = Database['public']['Tables']['responses']['Row']

export interface SurveyWithQuestions extends Survey {
  questions: Question[]
}

export interface QuestionOption {
  choices?: string[]
  min?: number
  max?: number
  step?: number
}

export interface AnswerValidation {
  isValid: boolean
  errors: string[]
}

export function validateQuestionAnswer(
  question: Question,
  answer: unknown
): AnswerValidation {
  const errors: string[] = []

  // Check if answer is required but missing
  if (question.required && (answer === undefined || answer === null || answer === '')) {
    errors.push('This question is required')
    return { isValid: false, errors }
  }

  // If not required and empty, it's valid
  if (!question.required && (answer === undefined || answer === null || answer === '')) {
    return { isValid: true, errors: [] }
  }

  // Validate based on question type
  switch (question.type) {
    case 'text':
      if (typeof answer !== 'string') {
        errors.push('Answer must be text')
      }
      break

    case 'boolean':
      if (typeof answer !== 'boolean') {
        errors.push('Answer must be true or false')
      }
      break

    case 'single_choice':
      const singleChoiceOptions = (question.options as QuestionOption)?.choices || []
      if (typeof answer !== 'string' || !singleChoiceOptions.includes(answer)) {
        errors.push('Please select a valid option')
      }
      break

    case 'multiple_choice':
      const multipleChoiceOptions = (question.options as QuestionOption)?.choices || []
      if (!Array.isArray(answer)) {
        errors.push('Answer must be an array of choices')
      } else {
        const invalidChoices = answer.filter(choice => !multipleChoiceOptions.includes(choice))
        if (invalidChoices.length > 0) {
          errors.push('Some selected options are not valid')
        }
      }
      break

    case 'rating':
      const ratingOptions = question.options as QuestionOption
      const min = ratingOptions?.min || 1
      const max = ratingOptions?.max || 5

      if (typeof answer !== 'number' || answer < min || answer > max) {
        errors.push(`Rating must be between ${min} and ${max}`)
      }
      break

    default:
      errors.push('Unknown question type')
  }

  return { isValid: errors.length === 0, errors }
}

export function validateSurveyResponse(
  questions: Question[],
  answers: Record<string, unknown>
): AnswerValidation {
  const allErrors: string[] = []

  for (const question of questions) {
    const answer = answers[question.id]
    const validation = validateQuestionAnswer(question, answer)

    if (!validation.isValid) {
      allErrors.push(`${question.title}: ${validation.errors.join(', ')}`)
    }
  }

  return { isValid: allErrors.length === 0, errors: allErrors }
}

export function generateSurveySlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatSurveyDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function calculateResponseRate(
  totalResponses: number,
  totalViews: number
): number {
  if (totalViews === 0) return 0
  return Math.round((totalResponses / totalViews) * 100)
}

export function anonymizeResponse(response: Response): Omit<Response, 'ip_address' | 'respondent_id'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ip_address, respondent_id, ...anonymized } = response
  return anonymized
}