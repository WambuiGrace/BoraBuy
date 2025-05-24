"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MobileNav } from "@/components/mobile-nav"
import type { Product, Supplier } from "@/types/database"
import { Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PriceEntryPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [formData, setFormData] = useState({
    product_id: "",
    supplier_id: "",
    price: "",
    quantity: "1",
    notes: "",
    entry_date: new Date().toISOString().split("T")[0],
  })
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchProductsAndSuppliers()
    }
  }, [user])

  const fetchProductsAndSuppliers = async () => {
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        supabase.from("products").select("*").eq("user_id", user?.id).eq("is_active", true),
        supabase.from("suppliers").select("*").eq("user_id", user?.id).eq("is_active", true),
      ])

      setProducts(productsRes.data || [])
      setSuppliers(suppliersRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("price_entries").insert({
        user_id: user?.id,
        product_id: formData.product_id,
        supplier_id: formData.supplier_id,
        price: Number.parseFloat(formData.price),
        quantity: Number.parseFloat(formData.quantity),
        notes: formData.notes,
        entry_date: formData.entry_date,
      })

      if (error) throw error

      toast({
        title: "Price entry added!",
        description: "Your price entry has been saved successfully.",
      })

      // Reset form
      setFormData({
        product_id: "",
        supplier_id: "",
        price: "",
        quantity: "1",
        notes: "",
        entry_date: new Date().toISOString().split("T")[0],
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav />

      <div className="p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Price Entry</h1>
          <p className="text-gray-600">Record a new supplier price</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price Information</CardTitle>
            <CardDescription>Enter the details for this price entry</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {products.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No products found.{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/products")}>
                      Add a product first
                    </Button>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                  required
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
                {suppliers.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No suppliers found.{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/suppliers")}>
                      Add a supplier first
                    </Button>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_date">Date</Label>
                <Input
                  id="entry_date"
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this price..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Add Price Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
