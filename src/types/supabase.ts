
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
      spreadsheets: {
        Row: {
          id: string
          title: string
          user_id: string | null
          created_at: string
          updated_at: string
          last_edited_at: string
          auto_save: boolean
        }
        Insert: {
          id?: string
          title?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
          last_edited_at?: string
          auto_save?: boolean
        }
        Update: {
          id?: string
          title?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
          last_edited_at?: string
          auto_save?: boolean
        }
      }
      spreadsheet_data: {
        Row: {
          id: string
          spreadsheet_id: string
          row_index: number
          column_index: number
          cell_value: string | null
          cell_type: string
          cell_style: Json
        }
        Insert: {
          id?: string
          spreadsheet_id: string
          row_index: number
          column_index: number
          cell_value?: string | null
          cell_type?: string
          cell_style?: Json
        }
        Update: {
          id?: string
          spreadsheet_id?: string
          row_index?: number
          column_index?: number
          cell_value?: string | null
          cell_type?: string
          cell_style?: Json
        }
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
