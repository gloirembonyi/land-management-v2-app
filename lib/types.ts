// Database types for the land management system

export interface Land {
  id: string
  owner_id: string
  title: string
  description?: string
  location_address: string
  latitude?: number
  longitude?: number
  area_size: number
  price?: number
  status: "pending" | "approved" | "rejected"
  blockchain_hash?: string
  qr_code_data?: string
  is_for_sale: boolean
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
  // Joined fields
  owner_name?: string
  owner_email?: string
  documents?: Document[]
}

export interface Document {
  id: string
  land_id: string
  document_type: "title_deed" | "survey_map" | "tax_certificate" | "identity_document" | "other"
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_by: string
  created_at: string
}

export interface Transaction {
  id: string
  land_id: string
  seller_id: string
  buyer_id: string
  transaction_amount: number
  status: "pending" | "approved" | "completed" | "cancelled"
  qr_code_data?: string
  blockchain_hash?: string
  payment_confirmed: boolean
  payment_confirmed_by?: string
  created_at: string
  updated_at: string
  completed_at?: string
  // Joined fields
  land_title?: string
  location_address?: string
  seller_name?: string
  seller_email?: string
  buyer_name?: string
  buyer_email?: string
}

export interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  related_land_id?: string
  related_transaction_id?: string
  is_read: boolean
  created_at: string
  read_at?: string
}

export interface LandRegistrationData {
  title: string
  description?: string
  location_address: string
  latitude?: number
  longitude?: number
  area_size: number
  price?: number
  documents: File[]
}

export interface User {
  id: string
  name: string
  email: string
  role?: string
  is_verified?: boolean
}

export interface LandParcel {
  id: string
  owner_id: string
  title: string
  description?: string
  location?: string // for backward compatibility
  location_address: string
  latitude?: number
  longitude?: number
  area_size: number
  size_hectares?: number // for backward compatibility
  price?: number
  estimated_value?: number // for backward compatibility
  status: "pending" | "approved" | "rejected"
  blockchain_hash?: string
  qr_code_data?: string
  is_for_sale: boolean
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
  // Joined fields
  owner_name?: string
  owner_email?: string
  documents?: Document[]
}
