"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { MobileNav } from "@/components/mobile-nav"
import type { Supplier } from "@/types/database"
import { Plus, Edit, Trash2, Users, Search, Phone, Mail, MapPin } from "lucide-react"

export default function SuppliersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchSuppliers()
    }
  }, [user])

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("name")

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from("suppliers")
          .update({
            name: formData.name,
            contact_person: formData.contact_person,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSupplier.id)

        if (error) throw error
        toast({ title: "Supplier updated successfully!" })
      } else {
        const { error } = await supabase.from("suppliers").insert({
          user_id: user?.id,
          name: formData.name,
          contact_person: formData.contact_person,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
        })

        if (error) throw error
        toast({ title: "Supplier added successfully!" })
      }

      setFormData({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      })
      setEditingSupplier(null)
      setDialogOpen(false)
      fetchSuppliers()
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

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (supplierId: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return

    try {
      const { error } = await supabase.from("suppliers").update({ is_active: false }).eq("id", supplierId)

      if (error) throw error
      toast({ title: "Supplier deleted successfully!" })
      fetchSuppliers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav />

      <div className="p-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-gray-600">Manage your supplier contacts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingSupplier(null)
                  setFormData({
                    name: "",
                    contact_person: "",
                    phone: "",
                    email: "",
                    address: "",
                    notes: "",
                  })
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
                <DialogDescription>
                  {editingSupplier ? "Update supplier information" : "Add a new supplier to your contacts"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Fresh Farm Supplies"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    placeholder="e.g., John Smith"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., contact@supplier.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Supplier address..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this supplier..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {editingSupplier ? "Update Supplier" : "Add Supplier"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first supplier"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Supplier
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{supplier.name}</h3>

                      {supplier.contact_person && (
                        <p className="text-sm text-gray-600 mb-2">Contact: {supplier.contact_person}</p>
                      )}

                      <div className="space-y-1">
                        {supplier.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{supplier.address}</span>
                          </div>
                        )}
                      </div>

                      {supplier.notes && <p className="text-sm text-gray-500 mt-2 italic">{supplier.notes}</p>}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(supplier.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
