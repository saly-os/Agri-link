"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MobileNav } from "@/components/mobile-nav";
import { HomeScreen } from "@/components/screens/home-screen";
import { SearchScreen } from "@/components/screens/search-screen";
import { ProfileScreen } from "@/components/screens/profile-screen";
import { MessagesScreen } from "@/components/screens/messages-screen";
import { ProducerDashboard } from "@/components/screens/producer-dashboard";
import { CartSheet } from "@/components/cart-sheet";
import { PaymentModal } from "@/components/payment-modal";
import { AddProductModal } from "@/components/add-product-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import {
  useProducts,
  useProducers,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useCreateOrder,
  useConversations,
  useOrders,
  useCategories,
  useMyProducts,
} from "@/lib/hooks/use-data";
import { mutate } from "swr";
import { toast } from "sonner";
import type { Product } from "@/lib/types/database";

function AppContent() {
  const router = useRouter();
  const supabase = createClient();
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Determine mode based on profile
  const isProducer = profile?.role === "producer";
  const [mode, setMode] = useState<"consumer" | "producer">(
    isProducer ? "producer" : "consumer"
  );

  // Fetch data
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: producersData } = useProducers();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { data: conversationsData } = useConversations();
  const { data: ordersData } = useOrders(
    mode === "producer" ? "producer" : "consumer"
  );

  // Categories (used to map category_id -> category enum name)
  const { data: categoriesData } = useCategories();

  // Mutations
  const { trigger: addToCart, isMutating: isAddingToCart } = useAddToCart();
  const { trigger: removeFromCart } = useRemoveFromCart();
  const { trigger: createOrder, isMutating: isCreatingOrder } =
    useCreateOrder();

  // Transform data for components
  const products = productsData?.data || [];
  const producers = producersData?.data || [];
  const cartItems = cartData?.data || [];
  const conversations = conversationsData?.data || [];
  const orders = ordersData?.data || [];

  // My products (for producer dashboard)
  const { data: myProductsData } = useMyProducts();
  const myProducts = myProductsData?.data || [];

  // Map DB product shape to dashboard product shape
  const mappedMyProducts = myProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price) || 0,
    unit: p.unit,
    stock: Number(p.stock_quantity) || 0,
    image: p.images?.[0] || p.image_url || "/placeholder.svg",
    active: p.is_available,
    views: p.view_count || 0,
  }));

  const cartCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0
  );
  const unreadMessages = conversations.filter(
    (c) => (c as { unread_count?: number }).unread_count
  ).length;

  const handleAddToCart = useCallback(
    async (product: Product) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        await addToCart({ product_id: product.id, quantity: 1 });
        mutate("/api/cart");
        toast.success("Produit ajoute au panier");
      } catch {
        toast.error("Erreur lors de l'ajout au panier");
      }
    },
    [user, router, addToCart]
  );

  const handleUpdateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity === 0) {
        try {
          await removeFromCart({ itemId: productId });
          mutate("/api/cart");
        } catch {
          toast.error("Erreur lors de la suppression");
        }
      }
    },
    [removeFromCart]
  );

  const handleRemoveFromCart = useCallback(
    async (productId: string) => {
      try {
        await removeFromCart({ itemId: productId });
        mutate("/api/cart");
        toast.success("Produit retire du panier");
      } catch {
        toast.error("Erreur lors de la suppression");
      }
    },
    [removeFromCart]
  );

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (paymentData: {
    method: string;
    phoneNumber: string;
    address: string;
  }) => {
    try {
      await createOrder({
        delivery_address: paymentData.address,
        payment_method: paymentData.method,
        phone_number: paymentData.phoneNumber,
      });

      mutate("/api/cart");
      mutate("/api/orders?role=consumer");
      setIsPaymentOpen(false);
      toast.success("Commande passee avec succes !");
      setActiveTab("home");
    } catch {
      toast.error("Erreur lors de la creation de la commande");
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "cart") {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setIsCartOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Transform cart items for CartSheet
  const cartSheetItems = cartItems.map((item) => ({
    id: item.id,
    name: item.product?.name || "",
    price: item.product?.price || 0,
    unit: item.product?.unit || "",
    image: item.product?.images?.[0] || "/placeholder.svg",
    quantity: item.quantity,
    producer: {
      name:
        (item.product?.producer as { business_name?: string })?.business_name ||
        "",
      location:
        (item.product?.producer as { region?: { name?: string } })?.region?.name ||
        "Senegal",
      rating: (item.product?.producer as { rating?: number })?.rating || 4.5,
    },
    category: item.product?.category?.name || "",
    inStock: (item.product?.is_available && item.product?.stock_quantity > 0) ?? false,
  }));

  // Transform products for components
  const transformedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    unit: p.unit,
    image: p.images?.[0] || "/placeholder.svg",
    producer: {
      name:
        (p.producer as { business_name?: string })?.business_name || "Producteur",
      location:
        (p.producer as { region?: { name?: string } })?.region?.name ||
        "Senegal",
      rating: (p.producer as { rating?: number })?.rating || 4.5,
    },
    category: p.category?.name || "",
    isOrganic: p.is_bio,
    inStock: p.is_available && p.stock_quantity > 0,
  }));

  // Transform producers for components
  const transformedProducers = producers.map((p) => ({
    id: p.id,
    name: p.business_name,
    avatar:
      (p.profile as { avatar_url?: string })?.avatar_url || "/placeholder.svg",
    location:
      (p as { region?: { name?: string } })?.region?.name || "Senegal",
    distance: "N/A",
    rating: p.rating || 4.5,
    reviewCount: p.total_reviews || 0,
    products: [],
    verified: p.is_certified_bio,
    phone: (p.profile as { phone?: string })?.phone || "",
  }));

  // Transform conversations for MessagesScreen
  const transformedConversations = conversations.map((c) => ({
    id: c.id,
    producer: {
      name:
        (c.producer as { business_name?: string })?.business_name ||
        "Producteur",
      avatar:
        (c.producer as { profile?: { avatar_url?: string } })?.profile
          ?.avatar_url || "/placeholder.svg",
      isOnline: false,
    },
    lastMessage: c.last_message || "",
    timestamp: c.last_message_at
      ? new Date(c.last_message_at).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    unread: (c as { unread_count?: number }).unread_count || 0,
    messages: [],
  }));

  // User data for profile
  const userData = {
    name: profile?.full_name || "Utilisateur",
    phone: profile?.phone || "",
    memberSince: profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        })
      : "",
    ordersCount: orders.length,
    favoriteProducers: 0,
  };

  // Producer data
  const producerProfile = profile?.producerProfile
    ? {
        name: profile.producerProfile.business_name,
        avatar: profile.avatar_url || "/placeholder.svg",
        location:
          (profile.producerProfile as { region?: { name?: string } })?.region
            ?.name || "Senegal",
        verified: profile.producerProfile.is_certified_bio,
      }
    : {
        name: "Mon Exploitation",
        avatar: "/placeholder.svg",
        location: "Senegal",
        verified: false,
      };

  const producerStats = profile?.producerProfile
    ? {
        totalSales: profile.producerProfile.total_sales * 10000,
        ordersToday: orders.filter((o) => {
          const today = new Date().toDateString();
          return new Date(o.created_at).toDateString() === today;
        }).length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        rating: profile.producerProfile.rating,
        reviewCount: profile.producerProfile.total_reviews,
      }
    : {
        totalSales: 0,
        ordersToday: 0,
        pendingOrders: 0,
        rating: 0,
        reviewCount: 0,
      };

  // Transform producer orders
  const producerOrders = orders.map((o) => ({
    id: o.id,
    customer:
      (o as { consumer?: { full_name?: string } })?.consumer?.full_name ||
      "Client",
    items:
      o.items?.map((i) => `${i.quantity} ${i.product?.name}`).join(", ") || "",
    total: o.total_amount,
    timestamp: new Date(o.created_at).toLocaleString("fr-FR"),
    status: (o.status === "preparing" ? "pending" : o.status) as "pending" | "confirmed" | "ready" | "delivered",
  }));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Producer mode
  if (mode === "producer" && isProducer) {
    // Improved handleAddProduct function
    const handleAddProduct = async (formData: {
      name: string;
      description: string;
      price: number;
      unit: string;
      categoryId: string;
      stock: number;
      isOrganic: boolean;
      images?: string[];
      minOrder?: number;
    }) => {
      if (!user) return;

      // Validate required fields
      if (
        !formData.name ||
        !formData.price ||
        !formData.unit ||
        !formData.stock ||
        !formData.categoryId
      ) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      try {
        const { data: producerProfile } = await supabase
          .from("producer_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!producerProfile) {
          toast.error("Aucun profil producteur trouvé");
          return;
        }

        // Resolve category name from categoryId (DB uses `category` enum)
        const category = categoriesData?.data?.find((c: { id: string; name: string }) => c.id === formData.categoryId);

        if (!category) {
          console.error("Category not found for id:", formData.categoryId);
          toast.error("Catégorie introuvable");
          return;
        }

        // Normalize display name to enum value (remove accents, lowercase)
        const toCategoryEnumClient = (name: string) =>
          name
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        const categoryEnum = toCategoryEnumClient(category.name);

        const { data: insertedProduct, error: insertError } = await supabase
          .from("products")
          .insert({
            name: formData.name,
            description: formData.description || "",
            price: formData.price,
            unit: formData.unit,
            category: categoryEnum, // product_category enum value
            stock_quantity: formData.stock,
            min_order_quantity: formData.minOrder || 1,
            is_bio: formData.isOrganic,
            images: formData.images || [],
            producer_id: producerProfile.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Insert product error:", insertError);
          toast.error(insertError.message || "Erreur lors de l'ajout du produit");
          return;
        }

        // Success: revalidate and notify
        mutate("/api/products");
        mutate("/api/products?mine=true");
        toast.success("Produit ajouté avec succès");
        setIsAddProductOpen(false);
      } catch (err: any) {
        toast.error(err?.message || "Erreur lors de l'ajout du produit");
      }
    };

    // Delete product (producer-owned)
    const handleDeleteProduct = async (product: any) => {
      if (!user) return;
      if (!confirm(`Supprimer le produit "${product.name}" ?`)) return;

      try {
        const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
        const payload = await res.json();
        if (!res.ok) {
          toast.error(payload.error || "Erreur lors de la suppression");
          return;
        }

        // Refresh lists
        mutate("/api/products?mine=true");
        mutate("/api/products");
        toast.success("Produit supprime");
      } catch (err) {
        toast.error("Erreur lors de la suppression");
      }
    };

    // Toggle product availability
    const handleToggleProduct = async (product: any, active: boolean) => {
      if (!user) return;

      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_available: active }),
        });
        const payload = await res.json();
        if (!res.ok) {
          toast.error(payload.error || "Erreur lors de la mise a jour");
          return;
        }

        mutate("/api/products?mine=true");
        mutate("/api/products");
        toast.success(active ? "Produit active" : "Produit desactive");
      } catch (err) {
        toast.error("Erreur lors de la mise a jour");
      }
    };

    // Edit product (placeholder)
    const handleEditProduct = (product: any) => {
      // TODO: open edit modal
      toast(`Modifier: ${product.name}`);
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("consumer")}
            className="bg-background/95 backdrop-blur"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mode Acheteur
          </Button>
        </div>

        <ProducerDashboard
          producer={producerProfile}
          stats={producerStats}
          products={mappedMyProducts}
          orders={producerOrders}
          onAddProduct={() => setIsAddProductOpen(true)}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleProduct={handleToggleProduct}
          onViewOrder={() => {}}
          onUpdateOrderStatus={() => {}}
        />

        <AddProductModal
          open={isAddProductOpen}
          onClose={() => setIsAddProductOpen(false)}
          onSubmit={handleAddProduct}
        />
      </div>
    );
  }

  // Consumer mode
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Preview Frame */}
      <div className="hidden lg:flex items-center justify-center min-h-screen bg-muted/50 p-8">
        <div className="text-center mb-8 absolute top-8 left-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AgriLink</h1>
          <p className="text-muted-foreground">
            Marketplace Agricole - Senegal
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Apercu mobile responsive
            </span>
          </div>
          {!user && (
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => router.push("/auth/login")}>
                Connexion
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/auth/signup")}
              >
                Inscription
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Frame */}
        <div className="relative">
          <div className="absolute -inset-4 bg-foreground rounded-[3rem]" />
          <div className="relative w-[375px] h-[812px] bg-background rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-foreground rounded-b-3xl z-50" />

            <div className="h-full overflow-hidden pt-7">
              {productsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {activeTab === "home" && (
                    <HomeScreen
                      products={transformedProducts}
                      onAddToCart={(p) => {
                        const original = products.find(
                          (prod) => prod.id === p.id
                        );
                        if (original) handleAddToCart(original);
                      }}
                      onViewProduct={() => {}}
                      onSearch={() => setActiveTab("search")}
                    />
                  )}
                  {activeTab === "search" && (
                    <SearchScreen
                      products={transformedProducts}
                      producers={transformedProducers}
                      onAddToCart={(p) => {
                        const original = products.find(
                          (prod) => prod.id === p.id
                        );
                        if (original) handleAddToCart(original);
                      }}
                      onViewProduct={() => {}}
                      onContactProducer={() => {}}
                      onViewProducer={() => {}}
                    />
                  )}
                  {activeTab === "messages" && (
                    <MessagesScreen
                      conversations={transformedConversations}
                    />
                  )}
                  {activeTab === "profile" && (
                    <ProfileScreen
                      user={userData}
                      onSwitchToProducer={() => {
                        if (isProducer) {
                          setMode("producer");
                        } else {
                          router.push("/auth/signup");
                        }
                      }}
                    />
                  )}

                  <MobileNav
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    cartCount={cartCount}
                    messageCount={unreadMessages}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        {productsLoading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === "home" && (
              <HomeScreen
                products={transformedProducts}
                onAddToCart={(p) => {
                  const original = products.find((prod) => prod.id === p.id);
                  if (original) handleAddToCart(original);
                }}
                onViewProduct={() => {}}
                onSearch={() => setActiveTab("search")}
              />
            )}
            {activeTab === "search" && (
              <SearchScreen
                products={transformedProducts}
                producers={transformedProducers}
                onAddToCart={(p) => {
                  const original = products.find((prod) => prod.id === p.id);
                  if (original) handleAddToCart(original);
                }}
                onViewProduct={() => {}}
                onContactProducer={() => {}}
                onViewProducer={() => {}}
              />
            )}
            {activeTab === "messages" && (
              <MessagesScreen conversations={transformedConversations} />
            )}
            {activeTab === "profile" && (
              <ProfileScreen
                user={userData}
                onSwitchToProducer={() => {
                  if (isProducer) {
                    setMode("producer");
                  } else {
                    router.push("/auth/signup");
                  }
                }}
              />
            )}

            <MobileNav
              activeTab={activeTab}
              onTabChange={handleTabChange}
              cartCount={cartCount}
              messageCount={unreadMessages}
            />
          </>
        )}
      </div>

      {/* Cart Sheet */}
      <CartSheet
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartSheetItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={
          cartSheetItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          ) +
          (cartSheetItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          ) > 10000
            ? 0
            : 1500)
        }
        onSuccess={handlePaymentSuccess}
        isLoading={isCreatingOrder}
      />
    </div>
  );
}

export default function AgriLinkApp() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
