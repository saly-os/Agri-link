"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type {
  Product,
  Category,
  Region,
  CartItem,
  Order,
  Conversation,
  Message,
  Profile,
  ProducerProfile,
} from "@/lib/types/database";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Une erreur est survenue");
  }
  return res.json();
};

async function postFetcher(
  url: string,
  { arg }: { arg: Record<string, unknown> }
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Une erreur est survenue");
  }
  return res.json();
}

async function patchFetcher(
  url: string,
  { arg }: { arg: Record<string, unknown> }
) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Une erreur est survenue");
  }
  return res.json();
}

async function deleteFetcher(url: string) {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Une erreur est survenue");
  }
  return res.json();
}

// Products
export function useProducts(params?: {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isBio?: boolean;
  regionId?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set("category_id", params.categoryId);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.minPrice) searchParams.set("min_price", String(params.minPrice));
  if (params?.maxPrice) searchParams.set("max_price", String(params.maxPrice));
  if (params?.isBio) searchParams.set("is_bio", "true");
  if (params?.regionId) searchParams.set("region_id", params.regionId);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const queryString = searchParams.toString();
  const url = `/api/products${queryString ? `?${queryString}` : ""}`;

  return useSWR<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>(url, fetcher);
}

export function useProduct(id: string | null) {
  return useSWR<{ data: Product }>(id ? `/api/products/${id}` : null, fetcher);
}

export function useCreateProduct() {
  return useSWRMutation("/api/products", postFetcher);
}

// My producer products (authenticated)
export function useMyProducts() {
  return useSWR<{ data: Product[] }>(`/api/products?mine=true`, fetcher);
}

export function useUpdateProduct(id: string) {
  return useSWRMutation(`/api/products/${id}`, patchFetcher);
}

// Categories
export function useCategories() {
  return useSWR<{ data: Category[] }>("/api/categories", fetcher);
}

// Regions
export function useRegions() {
  return useSWR<{ data: Region[] }>("/api/regions", fetcher);
}

// Cart
export function useCart() {
  return useSWR<{ data: CartItem[] }>("/api/cart", fetcher);
}

export function useAddToCart() {
  return useSWRMutation("/api/cart", postFetcher);
}

export function useRemoveFromCart() {
  return useSWRMutation(
    "/api/cart",
    async (url: string, { arg }: { arg: { itemId?: string } }) => {
      const params = arg.itemId ? `?item_id=${arg.itemId}` : "";
      return deleteFetcher(`${url}${params}`);
    }
  );
}

// Orders
export function useOrders(role: "consumer" | "producer" = "consumer") {
  return useSWR<{ data: Order[] }>(`/api/orders?role=${role}`, fetcher);
}

export function useOrder(id: string | null) {
  return useSWR<{ data: Order }>(id ? `/api/orders/${id}` : null, fetcher);
}

export function useCreateOrder() {
  return useSWRMutation("/api/orders", postFetcher);
}

export function useUpdateOrder(id: string) {
  return useSWRMutation(`/api/orders/${id}`, patchFetcher);
}

// Conversations
export function useConversations() {
  return useSWR<{ data: Conversation[] }>("/api/conversations", fetcher);
}

export function useCreateConversation() {
  return useSWRMutation("/api/conversations", postFetcher);
}

// Messages
export function useMessages(conversationId: string | null) {
  return useSWR<{ data: Message[] }>(
    conversationId ? `/api/conversations/${conversationId}/messages` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
}

export function useSendMessage(conversationId: string) {
  return useSWRMutation(
    `/api/conversations/${conversationId}/messages`,
    postFetcher
  );
}

// Producers
export function useProducers(params?: {
  regionId?: string;
  isBio?: boolean;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.regionId) searchParams.set("region_id", params.regionId);
  if (params?.isBio) searchParams.set("is_bio", "true");
  if (params?.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  const url = `/api/producers${queryString ? `?${queryString}` : ""}`;

  return useSWR<{ data: (ProducerProfile & { profile: Profile })[] }>(
    url,
    fetcher
  );
}

export function useProducer(id: string | null) {
  return useSWR<{ data: ProducerProfile & { profile: Profile; products: Product[] } }>(
    id ? `/api/producers/${id}` : null,
    fetcher
  );
}

// Profile
export function useProfile() {
  return useSWR<{
    data: Profile & { producerProfile?: ProducerProfile };
  }>("/api/profile", fetcher);
}

export function useUpdateProfile() {
  return useSWRMutation("/api/profile", patchFetcher);
}

// Favorites
export function useFavorites() {
  return useSWR<{ data: { id: string; product: Product }[] }>(
    "/api/favorites",
    fetcher
  );
}

export function useToggleFavorite() {
  return useSWRMutation("/api/favorites", postFetcher);
}

// Reviews
export function useReviews(producerId: string | null) {
  return useSWR<{
    data: {
      id: string;
      rating: number;
      comment: string;
      created_at: string;
      reviewer: { full_name: string; avatar_url: string };
    }[];
  }>(producerId ? `/api/reviews?producer_id=${producerId}` : null, fetcher);
}

export function useCreateReview() {
  return useSWRMutation("/api/reviews", postFetcher);
}
