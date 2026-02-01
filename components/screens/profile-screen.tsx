"use client"

import { 
  User, 
  MapPin, 
  CreditCard, 
  Heart, 
  Clock, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Package,
  Star,
  Bell
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface ProfileScreenProps {
  user: {
    name: string
    phone: string
    avatar?: string
    memberSince: string
    ordersCount: number
    favoriteProducers: number
  }
  onSwitchToProducer?: () => void
}

export function ProfileScreen({ user, onSwitchToProducer }: ProfileScreenProps) {
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase()

  const menuItems = [
    { icon: Package, label: "Mes commandes", badge: "3 en cours", href: "#" },
    { icon: Heart, label: "Producteurs favoris", badge: String(user.favoriteProducers), href: "#" },
    { icon: CreditCard, label: "Moyens de paiement", href: "#" },
    { icon: MapPin, label: "Adresses de livraison", href: "#" },
    { icon: Bell, label: "Notifications", href: "#", toggle: true },
    { icon: Settings, label: "Parametres", href: "#" },
    { icon: HelpCircle, label: "Aide & Support", href: "#" },
  ]

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="bg-primary px-4 pb-8 pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-primary-foreground text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-primary-foreground">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-primary-foreground/80">{user.phone}</p>
            <p className="text-sm text-primary-foreground/60 mt-1">
              Membre depuis {user.memberSince}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 -mt-4 space-y-4">
        {/* Stats Card */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{user.ordersCount}</p>
                <p className="text-xs text-muted-foreground">Commandes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{user.favoriteProducers}</p>
                <p className="text-xs text-muted-foreground">Favoris</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-2xl font-bold">4.8</span>
                </div>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Switch to Producer Mode */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Etes-vous producteur ?</h3>
                <p className="text-sm text-muted-foreground">
                  Vendez vos produits sur AgriLink
                </p>
              </div>
              <Button onClick={onSwitchToProducer}>
                Commencer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={item.label}>
                  <button className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                    </div>
                    {item.badge && !item.toggle && (
                      <Badge variant="secondary">{item.badge}</Badge>
                    )}
                    {item.toggle ? (
                      <Switch defaultChecked />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full text-destructive hover:text-destructive bg-transparent">
          <LogOut className="h-4 w-4 mr-2" />
          Se deconnecter
        </Button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          AgriLink v1.0.0 - MVP Senegal
        </p>
      </main>
    </div>
  )
}
