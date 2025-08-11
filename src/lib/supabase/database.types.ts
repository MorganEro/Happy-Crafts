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
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          company: string
          description: string
          image: string
          price: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          company: string
          description: string
          image: string
          price: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          company?: string
          description?: string
          image?: string
          price?: number
        }
      }
      // Add other tables as needed
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
