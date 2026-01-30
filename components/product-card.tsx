"use client"

import { Star, MapPin, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface Product {
  id: string
  name: string
  price: number
  unit: string
  image: string
  producer: {
    name: string
    location: string
    rating: number
  }
  category: string
  isOrganic?: boolean
  inStock: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onViewDetails: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-md"
      onClick={() => onViewDetails(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {product.isOrganic && (
          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
            Bio
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="font-semibold text-muted-foreground">Rupture</span>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-foreground">{product.name}</h3>
          <span className="whitespace-nowrap font-bold text-primary">
            {product.price.toLocaleString()} F
          </span>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">/{product.unit}</p>
        
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{product.producer.location}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span>{product.producer.rating.toFixed(1)}</span>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full gap-1"
          disabled={!product.inStock}
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart(product)
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </CardContent>
    </Card>
  )
}
