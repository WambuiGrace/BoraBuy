"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileNav } from "@/components/mobile-nav"
import { format } from "date-fns"

interface PriceData {
  id: string
  price: number
  quantity: number
  entry_date: string
  product: {
    name: string
    unit: string
  }
  supplier: {
    name: string
  }
}

interface PriceStats {
  productId: string
  productName: string
  minPrice: number
  maxPrice: number
  avgPrice: number
  totalEntries: number
}

interface SupplierComparison {
  supplierId: string
  supplierName: string
  avgPrice: number
  totalEntries: number
  lastPrice: number
  lastUpdate: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [priceStats, setPriceStats] = useState<PriceStats[]>([])
  const [supplierComparisons, setSupplierComparisons] = useState<SupplierComparison[]>([])

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  useEffect(() => {
    if (selectedProduct) {
      fetchPriceData()
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from("products")
        .select("id, name")
        .eq("user_id", user?.id)
        .eq("is_active", true)

      setProducts(data || [])
      if (data && data.length > 0) {
        setSelectedProduct(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchPriceData = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Fetch price history for selected product
      const { data: historyData } = await supabase
        .from("price_entries")
        .select(`
          id,
          price,
          quantity,
          entry_date,
          product:products(name, unit),
          supplier:suppliers(name)
        `)
        .eq("product_id", selectedProduct)
        .eq("user_id", user?.id)
        .order("entry_date", { ascending: true })

      setPriceHistory(historyData || [])

      // Calculate price statistics for all products
      const { data: statsData } = await supabase
        .from("price_entries")
        .select(`
          product_id,
          products(name),
          price
        `)
        .eq("user_id", user?.id)

      if (statsData) {
        const stats = statsData.reduce((acc: { [key: string]: any }, entry) => {
          const productId = entry.product_id
          if (!acc[productId]) {
            acc[productId] = {
              productId,
              productName: entry.products?.name,
              prices: [],
              totalEntries: 0,
            }
          }
          acc[productId].prices.push(entry.price)
          acc[productId].totalEntries++
          return acc
        }, {})

        const priceStatsList = Object.values(stats).map((stat: any) => ({
          productId: stat.productId,
          productName: stat.productName,
          minPrice: Math.min(...stat.prices),
          maxPrice: Math.max(...stat.prices),
          avgPrice: stat.prices.reduce((a: number, b: number) => a + b, 0) / stat.prices.length,
          totalEntries: stat.totalEntries,
        }))

        setPriceStats(priceStatsList)
      }

      // Calculate supplier comparisons for selected product
      const { data: supplierData } = await supabase
        .from("price_entries")
        .select(`
          supplier_id,
          suppliers(name),
          price,
          entry_date
        `)
        .eq("product_id", selectedProduct)
        .eq("user_id", user?.id)

      if (supplierData) {
        const supplierStats = supplierData.reduce((acc: { [key: string]: any }, entry) => {
          const supplierId = entry.supplier_id
          if (!acc[supplierId]) {
            acc[supplierId] = {
              supplierId,
              supplierName: entry.suppliers?.name,
              prices: [],
              totalEntries: 0,
              lastPrice: 0,
              lastUpdate: "",
            }
          }
          acc[supplierId].prices.push(entry.price)
          acc[supplierId].totalEntries++
          
          // Update last price if this entry is more recent
          if (!acc[supplierId].lastUpdate || entry.entry_date > acc[supplierId].lastUpdate) {
            acc[supplierId].lastPrice = entry.price
            acc[supplierId].lastUpdate = entry.entry_date
          }
          
          return acc
        }, {})

        const supplierComparisonList = Object.values(supplierStats).map((stat: any) => ({
          supplierId: stat.supplierId,
          supplierName: stat.supplierName,
          avgPrice: stat.prices.reduce((a: number, b: number) => a + b, 0) / stat.prices.length,
          totalEntries: stat.totalEntries,
          lastPrice: stat.lastPrice,
          lastUpdate: stat.lastUpdate,
        }))

        setSupplierComparisons(supplierComparisonList)
      }
    } catch (error) {
      console.error("Error fetching price data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !priceHistory.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Price Reports</h1>
          <p className="text-gray-600">Analyze your price data and trends</p>
        </div>

        {/* Product Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Product</CardTitle>
            <CardDescription>Choose a product to view its price analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
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
          </CardContent>
        </Card>

        {/* Price Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Price Statistics</CardTitle>
            <CardDescription>Overview of price ranges for all products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceStats.map((stat) => (
                <div
                  key={stat.productId}
                  className={`p-4 rounded-lg border ${
                    stat.productId === selectedProduct ? "bg-blue-50 border-blue-200" : "bg-white"
                  }`}
                >
                  <h3 className="font-medium mb-2">{stat.productName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Minimum Price</p>
                      <p className="font-medium">KSh {stat.minPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Maximum Price</p>
                      <p className="font-medium">KSh {stat.maxPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Average Price</p>
                      <p className="font-medium">KSh {stat.avgPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Entries</p>
                      <p className="font-medium">{stat.totalEntries}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Comparison */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supplier Comparison</CardTitle>
            <CardDescription>Compare prices across different suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplierComparisons.map((comparison) => (
                <div key={comparison.supplierId} className="p-4 rounded-lg border bg-white">
                  <h3 className="font-medium mb-2">{comparison.supplierName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Average Price</p>
                      <p className="font-medium">KSh {comparison.avgPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Price</p>
                      <p className="font-medium">KSh {comparison.lastPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Update</p>
                      <p className="font-medium">{format(new Date(comparison.lastUpdate), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Entries</p>
                      <p className="font-medium">{comparison.totalEntries}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price History */}
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Recent price entries for the selected product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priceHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{entry.supplier.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">KSh {entry.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      {entry.quantity} {entry.product.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 