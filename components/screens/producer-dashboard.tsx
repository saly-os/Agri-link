"use client"

import { useState } from "react"
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Bell,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface ProducerStats {
  totalSales: number
  ordersToday: number
  pendingOrders: number
  rating: number
  reviewCount: number
}

interface ProducerProduct {
  id: string
  name: string
  price: number
  unit: string
  stock: number
  image: string
  active: boolean
  views: number
}

interface PendingOrder {
  id: string
  customer: string
  items: string
  total: number
  timestamp: string
  status: "pending" | "confirmed" | "ready" | "delivered"
}

interface ProducerDashboardProps {
  producer: {
    name: string
    avatar?: string
    location: string
    verified: boolean
  }
  stats: ProducerStats
  products: ProducerProduct[]
  orders: PendingOrder[]
  onAddProduct: () => void
  onEditProduct: (product: ProducerProduct) => void
  onDeleteProduct: (product: ProducerProduct) => void
  onToggleProduct: (product: ProducerProduct, active: boolean) => void
  onViewOrder: (order: PendingOrder) => void
  onUpdateOrderStatus: (order: PendingOrder, status: PendingOrder["status"]) => void
}

export function ProducerDashboard({
  producer,
  stats,
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleProduct,
  onViewOrder,
  onUpdateOrderStatus,
}: ProducerDashboardProps) {
  const initials = producer.name.split(" ").map(n => n[0]).join("").toUpperCase()

  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    ready: "bg-primary/10 text-primary border-primary/20",
    delivered: "bg-muted text-muted-foreground border-border",
  }

  const statusLabels = {
    pending: "En attente",
    confirmed: "Confirmee",
    ready: "Prete",
    delivered: "Livree",
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-muted/30">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-sidebar-primary">
              <AvatarImage src={producer.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg">{producer.name}</h1>
                {producer.verified && (
                  <Badge className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                    Verifie
                  </Badge>
                )}
              </div>
              <p className="text-sm text-sidebar-foreground/70">{producer.location}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground">
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-sidebar-accent border-sidebar-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-sidebar-primary" />
                <span className="text-xs text-sidebar-foreground/70">Ventes ce mois</span>
              </div>
              <p className="text-xl font-bold text-sidebar-foreground">
                {stats.totalSales.toLocaleString()} F
              </p>
            </CardContent>
          </Card>
          <Card className="bg-sidebar-accent border-sidebar-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-4 w-4 text-sidebar-primary" />
                <span className="text-xs text-sidebar-foreground/70">En attente</span>
              </div>
              <p className="text-xl font-bold text-sidebar-foreground">
                {stats.pendingOrders}
              </p>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Pending Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Commandes en cours</h2>
            <Badge variant="outline">{orders.length}</Badge>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucune commande en attente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 3).map((order) => (
                <Card key={order.id} className="cursor-pointer hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.items}</p>
                      </div>
                      <Badge className={cn("border", statusColors[order.status])}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{order.timestamp}</span>
                      </div>
                      <p className="font-semibold text-primary">
                        {order.total.toLocaleString()} F
                      </p>
                    </div>
                    {order.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => onUpdateOrderStatus(order, "confirmed")}
                        >
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => onUpdateOrderStatus(order, "confirmed")}
                        >
                          Accepter
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* My Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Mes produits</h2>
            <Button size="sm" onClick={onAddProduct}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-2">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <Switch
                          checked={product.active}
                          onCheckedChange={(checked) => onToggleProduct(product, checked)}
                        />
                      </div>
                      <p className="text-sm text-primary font-semibold">
                        {product.price.toLocaleString()} F/{product.unit}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Stock: {product.stock}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.views}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditProduct(product)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Performance */}
        <section>
          <h2 className="font-semibold mb-3">Performance</h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-xl font-bold">{stats.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Note</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.reviewCount}</p>
                  <p className="text-xs text-muted-foreground">Avis</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.ordersToday}</p>
                  <p className="text-xs text-muted-foreground">{"Aujourd'hui"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
