
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
      admins: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
        }
        Relationships: []
      }
      merchants: {
        Row: {
          id: string
          created_at: string
          name: string
          address: string | null
          category: string | null
          latitude: number | null
          longitude: number | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          address?: string | null
          category?: string | null
          latitude?: number | null
          longitude?: number | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          address?: string | null
          category?: string | null
          latitude?: number | null
          longitude?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      offers: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          discount: number | null
          start_date: string
          end_date: string
          conditions: string | null
          status: "PENDING" | "APPROVED" | "REJECTED"
          merchant_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          discount?: number | null
          start_date: string
          end_date: string
          conditions?: string | null
          status?: "PENDING" | "APPROVED" | "REJECTED"
          merchant_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          discount?: number | null
          start_date?: string
          end_date?: string
          conditions?: string | null
          status?: "PENDING" | "APPROVED" | "REJECTED"
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_merchant_id_fkey"
            columns: ["merchant_id"]
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          }
        ]
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
