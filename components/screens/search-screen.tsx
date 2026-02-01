"use client"

import { useState } from "react"
import { Search, Filter, MapPin, X, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ProducerCard, type Producer } from "@/components/producer-card"
import { ProductCard, type Product } from "@/components/product-card"

interface SearchScreenProps {
  products: Product[]
  producers: Producer[]
  onAddToCart: (product: Product) => void
  onViewProduct: (product: Product) => void
  // handlers now accept a producer id (string)
  onContactProducer: (producerId: string) => void
  onViewProducer: (producerId: string) => void
}

export function SearchScreen({
  products,
  producers,
  onAddToCart,
  onViewProduct,
  onContactProducer,
  onViewProducer,
}: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tab, setTab] = useState<"products" | "producers">("products")
  const [maxPrice, setMaxPrice] = useState([50000])
  const [maxDistance, setMaxDistance] = useState([50])
  const [onlyOrganic, setOnlyOrganic] = useState(false)
  const [onlyVerified, setOnlyVerified] = useState(false)

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPrice = p.price <= maxPrice[0]
    const matchesOrganic = !onlyOrganic || p.isOrganic
    return matchesSearch && matchesPrice && matchesOrganic
  })

  const filteredProducers = producers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.products.some(prod => prod.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesVerified = !onlyVerified || p.verified
    return matchesSearch && matchesVerified
  })

  const recentSearches = ["Tomates", "Mangues", "Poulet fermier", "Riz local"]

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Produits, producteurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>Affinez votre recherche</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <Label>Prix maximum: {maxPrice[0].toLocaleString()} FCFA</Label>
                  <Slider
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    max={100000}
                    step={1000}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label>Distance maximum: {maxDistance[0]} km</Label>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="organic">Produits Bio uniquement</Label>
                  <Switch
                    id="organic"
                    checked={onlyOrganic}
                    onCheckedChange={setOnlyOrganic}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="verified">Producteurs verifies</Label>
                  <Switch
                    id="verified"
                    checked={onlyVerified}
                    onCheckedChange={setOnlyVerified}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={tab === "products" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("products")}
            className="flex-1"
          >
            Produits ({filteredProducts.length})
          </Button>
          <Button
            variant={tab === "producers" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("producers")}
            className="flex-1"
          >
            Producteurs ({filteredProducers.length})
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        {/* Recent Searches (when no query) */}
        {!searchQuery && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Recherches recentes
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <Badge
                  key={search}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {tab === "products" ? (
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
        ) : (
          <div className="space-y-3">
            {filteredProducers.map((producer) => (
              <ProducerCard
                key={producer.id}
                producer={producer}
                onContact={(id) => onContactProducer(id)}
                onViewProfile={(id) => onViewProducer(id)}
              />
            ))}
          </div>
        )}

        {((tab === "products" && filteredProducts.length === 0) ||
          (tab === "producers" && filteredProducers.length === 0)) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">Aucun resultat</p>
            <p className="text-sm text-muted-foreground">
              Essayez avec d&apos;autres termes
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
