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
      properties: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          price_per_night: number
          currency: string
          bedrooms: number
          bathrooms: number
          max_guests: number
          area_sqm: number | null
          zone: string
          address: string | null
          latitude: number | null
          longitude: number | null
          amenities: string[] | null
          images: string[] | null
          is_featured: boolean
          is_available: boolean
          rating: number
          reviews_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      zones: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          properties_count: number
        }
        Insert: Omit<Database['public']['Tables']['zones']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['zones']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          guest_name: string
          guest_email: string
          guest_phone: string | null
          check_in: string
          check_out: string
          guests_count: number
          total_price: number | null
          status: 'pending' | 'confirmed' | 'cancelled'
          message: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          booking_id: string | null
          author_name: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helpers de tipos
export type Property = Database['public']['Tables']['properties']['Row']
export type Zone = Database['public']['Tables']['zones']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
