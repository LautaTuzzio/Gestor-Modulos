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
      subjects: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          dni: string
          email: string
          phone: string | null
          employment_status: 'titular' | 'provisional' | 'suplente'
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          dni: string
          email: string
          phone?: string | null
          employment_status: 'titular' | 'provisional' | 'suplente'
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          dni?: string
          email?: string
          phone?: string | null
          employment_status?: 'titular' | 'provisional' | 'suplente'
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      teacher_subjects: {
        Row: {
          id: string
          teacher_id: string
          subject_id: string
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          id?: string
          teacher_id: string
          subject_id: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Update: {
          id?: string
          teacher_id?: string
          subject_id?: string
          assigned_at?: string
          assigned_by?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'teacher'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'teacher'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'teacher'
          created_at?: string
        }
      }
    }
  }
}
