export interface UserProfile {
  id: string
  full_name?: string
  business_name?: string
  phone?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  user_id: string
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  name: string
  category: string
  unit: string
  description?: string
  is_active: boolean
}

export interface PriceEntry {
  id: string
  user_id: string
  product_id: string
  supplier_id: string
  price: number
  quantity: number
  notes?: string
  entry_date: string
  created_at: string
  product?: Product
  supplier?: Supplier
}

export interface PriceAlert {
  id: string
  user_id: string
  product_id: string
  alert_type: "price_increase" | "price_decrease" | "threshold"
  threshold_value?: number
  percentage_change?: number
  is_active: boolean
  created_at: string
  product?: Product
}
