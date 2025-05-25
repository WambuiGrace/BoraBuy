"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { addOfflinePriceEntry, isOnline } from "@/lib/offline-storage"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MobileNav } from "@/components/mobile-nav"

export default function PriceEntryPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [formData, setFormData] = useState({
    product_id: "",
    supplier_id: "",
    price: "",
    quantity: "",
    notes: "",
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Fetch products and suppliers in parallel
      const [productsResponse, suppliersResponse] = await Promise.all([
        supabase
          .from("products")
          .select("id, name")
          .eq("user_id", user?.id)
          .eq("is_active", true),
        supabase
          .from("suppliers")
          .select("id, name")
          .eq("user_id", user?.id)
          .eq("is_active", true),
      ])

      setProducts(productsResponse.data || [])
      setSuppliers(suppliersResponse.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load products and suppliers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const entry = {
      user_id: user.id,
      product_id: formData.product_id,
      supplier_id: formData.supplier_id,
      price: parseFloat(formData.price),
      quantity: parseFloat(formData.quantity),
      notes: formData.notes,
      entry_date: new Date().toISOString(),
    }

    try {
      if (isOnline()) {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("price_entries").insert(entry)

        if (error) throw error

        toast({
          title: "Success",
          description: "Price entry added successfully",
        })
      } else {
        await addOfflinePriceEntry(entry)
        toast({
          title: "Saved Offline",
          description: "Price entry will sync when you're back online",
        })
      }

      // Reset form
      setFormData({
        product_id: "",
        supplier_id: "",
        price: "",
        quantity: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error submitting entry:", error)
      toast({
        title: "Error",
        description: "Failed to save price entry",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav />

      <div className="container mx-auto py-8 px-4 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Add Price Entry</CardTitle>
            <CardDescription>Record a new price for a product</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, product_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, supplier_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (KSh)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Add any additional notes..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Save Price Entry"}
              </Button>

              {!isOnline() && (
                <p className="text-sm text-amber-600 text-center mt-2">
                  You're offline. Entry will sync when you're back online.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
