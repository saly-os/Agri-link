"use client"

import { Star, MapPin, Phone, MessageCircle, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export interface Producer {
  id: string
  name: string
  avatar: string
  location: string
  distance: string
  rating: number
  reviewCount: number
  products: string[]
  verified: boolean
  phone: string
}

interface ProducerCardProps {
  producer: Producer
  // handlers now receive the producer id (string)
  onContact: (producerId: string) => void
  onViewProfile: (producerId: string) => void
}

export function ProducerCard({ producer, onContact, onViewProfile }: ProducerCardProps) {
  const initials = producer.name.split(" ").map(n => n[0]).join("").toUpperCase()

  return (
    <Card className="border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={producer.avatar || "/placeholder.svg"} alt={producer.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{producer.name}</h3>
              {producer.verified && (
                <Badge variant="secondary" className="shrink-0 text-xs bg-primary/10 text-primary">
                  Verifie
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{producer.location}</span>
              </div>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{producer.distance}</span>
            </div>
            
            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3.5 w-3.5",
                      star <= Math.round(producer.rating)
                        ? "fill-accent text-accent"
                        : "text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({producer.reviewCount} avis)
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {producer.products.slice(0, 3).map((product) => (
                <Badge key={product} variant="outline" className="text-xs font-normal">
                  {product}
                </Badge>
              ))}
              {producer.products.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{producer.products.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 bg-transparent"
            onClick={() => onContact(producer.id)}
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onViewProfile(producer.id)}
          >
            Voir produits
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"
