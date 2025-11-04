export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      surveys: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          created_by: string
          is_active: boolean
          settings: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          is_active?: boolean
          settings?: Json | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          is_active?: boolean
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          survey_id: string
          title: string
          type: 'text' | 'multiple_choice' | 'single_choice' | 'rating' | 'boolean'
          options: Json | null
          required: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          title: string
          type: 'text' | 'multiple_choice' | 'single_choice' | 'rating' | 'boolean'
          options?: Json | null
          required?: boolean
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          title?: string
          type?: 'text' | 'multiple_choice' | 'single_choice' | 'rating' | 'boolean'
          options?: Json | null
          required?: boolean
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_survey_id_fkey"
            columns: ["survey_id"]
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          }
        ]
      }
      responses: {
        Row: {
          id: string
          survey_id: string
          respondent_id: string | null
          answers: Json
          submitted_at: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          respondent_id?: string | null
          answers: Json
          submitted_at?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          respondent_id?: string | null
          answers?: Json
          submitted_at?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_survey_id_fkey"
            columns: ["survey_id"]
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}