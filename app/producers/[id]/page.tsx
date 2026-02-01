import React from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

interface Props {
  params: { id: string };
}

export default async function ProducerPage({ params }: Props) {
  const { id } = params;

  // Fetch producer details (includes products)
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/producers/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return notFound();
  }

  const json = await res.json();
  const producer = json.data;

  if (!producer) return notFound();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary px-4 py-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <img src={producer.cover_image_url || "/placeholder.svg"} className="h-20 w-20 object-cover rounded-lg" />
          <div>
            <h1 className="text-2xl font-bold">{producer.business_name}</h1>
            <p className="text-sm">{producer.description}</p>
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Produits de {producer.business_name}</h2>
          <Button asChild>
            <a href={`mailto:${producer.profile?.email}`}>Contacter</a>
          </Button>
        </div>

        {producer.products?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ce producteur n'a pas encore de produits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {producer.products.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  unit: p.unit,
                  image: p.images?.[0] || p.image_url || "/placeholder.svg",
                  producer: {
                    name: producer.business_name,
                    location: producer.region?.name || "Senegal",
                    rating: producer.rating || 4.5,
                  },
                  category: p.category?.name || "",
                  isOrganic: p.is_bio,
                  inStock: p.is_available && p.stock_quantity > 0,
                }}
                onAddToCart={() => {}}
                onViewDetails={() => {}}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
