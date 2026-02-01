"use client"

import { Home, Search, ShoppingCart, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  cartCount?: number
  messageCount?: number
}

export function MobileNav({ activeTab, onTabChange, cartCount = 0, messageCount = 0 }: MobileNavProps) {
  const tabs = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "search", label: "Explorer", icon: Search },
    { id: "cart", label: "Panier", icon: ShoppingCart, badge: cartCount },
    { id: "messages", label: "Messages", icon: MessageCircle, badge: messageCount },
    { id: "profile", label: "Profil", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>
              <span className={cn("font-medium", isActive && "font-semibold")}>{tab.label}</span>
            </button>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  )
}
