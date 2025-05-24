"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PriceEntry } from "@/types/database"
import { Package, Users, DollarSign, Plus, BarChart3 } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"

export default function Dashboard() {
  const { user } = useAuth()
  const [recentEntries, setRecentEntries] = useState<PriceEntry[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    totalEntries: 0,
    avgPrice: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch recent price entries with product and supplier info
      const { data: entries } = await supabase
        .from("price_entries")
        .select(`
          *,
          product:products(*),
          supplier:suppliers(*)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch stats
      const [productsCount, suppliersCount, entriesCount] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("suppliers").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("price_entries").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
      ])

      // Calculate average price
      const { data: avgData } = await supabase.from("price_entries").select("price").eq("user_id", user?.id)

      const avgPrice = avgData?.length
        ? avgData.reduce((sum, entry) => sum + Number(entry.price), 0) / avgData.length
        : 0

      setRecentEntries(entries || [])
      setStats({
        totalProducts: productsCount.count || 0,
        totalSuppliers: suppliersCount.count || 0,
        totalEntries: entriesCount.count || 0,
        avgPrice,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
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

      <div className="p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suppliers</p>
                  <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Price Entries</p>
                  <p className="text-2xl font-bold">{stats.totalEntries}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold">${stats.avgPrice.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/price-entry">
                <Button className="w-full h-12" variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Price
                </Button>
              </Link>
              <Link href="/products">
                <Button className="w-full h-12" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </Button>
              </Link>
              <Link href="/suppliers">
                <Button className="w-full h-12" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Suppliers
                </Button>
              </Link>
              <Link href="/reports">
                <Button className="w-full h-12" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Price Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Price Entries</CardTitle>
            <CardDescription>Your latest price updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No price entries yet</p>
                <Link href="/price-entry">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Price
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{entry.product?.name}</p>
                      <p className="text-sm text-gray-600">{entry.supplier?.name}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.entry_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${Number(entry.price).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">per {entry.product?.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
