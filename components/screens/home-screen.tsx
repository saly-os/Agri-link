"use client"

import { useState } from "react"
import { Search, Bell, MapPin, ChevronRight, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CategoryPills } from "@/components/category-pills"
import { ProductCard, type Product } from "@/components/product-card"

interface HomeScreenProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onViewProduct: (product: Product) => void
  onSearch: (query: string) => void
}

export function HomeScreen({ products, onAddToCart, onViewProduct, onSearch }: HomeScreenProps) {
  const [category, setCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = products.filter((p) => {
    const matchesCategory = category === "all" || p.category === category
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredProducts = products.filter((p) => p.isOrganic).slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary px-4 pb-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-primary-foreground">
            <p className="text-sm opacity-90">Bienvenue sur</p>
            <h1 className="text-2xl font-bold tracking-tight">AgriLink</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-primary-foreground/90 text-sm mb-4">
          <MapPin className="h-4 w-4" />
          <span>Dakar, Senegal</span>
          <ChevronRight className="h-4 w-4" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-0"
          />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Categories */}
        <section>
          <CategoryPills selected={category} onSelect={setCategory} />
        </section>

        {/* Featured Products */}
        {!searchQuery && category === "all" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Produits Bio</h2>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                Voir tout
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">
              {category === "all" ? "Tous les produits" : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
            </h2>
            <Badge variant="secondary">{filteredProducts.length} produits</Badge>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun produit trouve</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  setCategory("all")
                  setSearchQuery("")
                }}
              >
                Reinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewProduct}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
