"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Package, Users, Plus, BarChart3, Settings, Menu, LogOut, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Suppliers", href: "/suppliers", icon: Users },
  { name: "Add Price", href: "/price-entry", icon: Plus },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Price Tracker</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="py-4">
                    <h2 className="text-lg font-semibold">Menu</h2>
                  </div>

                  <nav className="flex-1 space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            pathname === item.href ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </nav>

                  <div className="border-t pt-4 space-y-2">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        signOut()
                        setOpen(false)
                      }}
                      className="w-full justify-start px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors",
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
