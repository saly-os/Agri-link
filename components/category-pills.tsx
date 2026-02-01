"use client"

import { cn } from "@/lib/utils"
import { Wheat, Salad, Apple, Beef, Fish, Egg, Milk, Package } from "lucide-react"

const categories = [
  { id: "all", label: "Tout", icon: Package },
  { id: "cereales", label: "Cereales", icon: Wheat },
  { id: "legumes", label: "Legumes", icon: Salad },
  { id: "fruits", label: "Fruits", icon: Apple },
  { id: "viande", label: "Viande", icon: Beef },
  { id: "poisson", label: "Poisson", icon: Fish },
  { id: "oeufs", label: "Oeufs", icon: Egg },
  { id: "lait", label: "Laitiers", icon: Milk },
]

interface CategoryPillsProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const Icon = category.icon
        const isSelected = selected === category.id
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
