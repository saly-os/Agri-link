"use client"

import React, { useState, useRef } from "react"
import { Camera, X, Loader2 } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCategories } from "@/lib/hooks/use-data"

interface AddProductModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (product: ProductFormData) => Promise<void>
  isLoading?: boolean
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  unit: string
  categoryId: string
  stock: number
  isOrganic: boolean
  image?: File
}

const units = [
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "g", label: "Gramme (g)" },
  { value: "piece", label: "Piece" },
  { value: "botte", label: "Botte" },
  { value: "sac", label: "Sac" },
  { value: "litre", label: "Litre" },
]

export function AddProductModal({ open, onClose, onSubmit, isLoading }: AddProductModalProps) {
  const { data: categoriesData, error: categoriesError, isLoading: isCategoriesLoading } = useCategories()
  const categories = categoriesData?.data ?? []
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    unit: "kg",
    categoryId: "",
    stock: 0,
    isOrganic: false,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: undefined })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    // Reset form
    setFormData({
      name: "",
      description: "",
      price: 0,
      unit: "kg",
      categoryId: "",
      stock: 0,
      isOrganic: false,
    })
    setImagePreview(null)
  }

  const isValid = formData.name && formData.price > 0 && formData.categoryId && formData.stock > 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
          <DialogDescription>
            Remplissez les informations de votre produit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photo du produit</Label>
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter une photo
                    </p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              placeholder="Ex: Tomates fraiches"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Decrivez votre produit..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categorie *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              disabled={isLoading || isCategoriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une categorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__no_categories" disabled>
                    {categoriesError ? "Erreur de chargement" : "Aucune catégorie trouvée"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {categories.length === 0 && !isCategoriesLoading && (
              <p className="text-sm text-muted-foreground pt-1">
                Aucune catégorie disponible. Veuillez en créer depuis le tableau de bord ou via l'API.
              </p>
            )}
          </div>

          {/* Price and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="1500"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Unite *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">Quantite disponible *</Label>
            <Input
              id="stock"
              type="number"
              placeholder="100"
              value={formData.stock || ""}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              disabled={isLoading}
            />
          </div>

          {/* Organic */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="organic">Produit Bio</Label>
              <p className="text-sm text-muted-foreground">
                Certifie agriculture biologique
              </p>
            </div>
            <Switch
              id="organic"
              checked={formData.isOrganic}
              onCheckedChange={(checked) => setFormData({ ...formData, isOrganic: checked })}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 bg-transparent" 
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={!isValid || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
