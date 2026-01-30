import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const categoryId = searchParams.get("category_id");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const isBio = searchParams.get("is_bio");
  const regionId = searchParams.get("region_id");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      producer:producer_profiles(
        *,
        profile:profiles(full_name, avatar_url),
        region:regions(name)
      )
    `,
      { count: "exact" }
    )
    .eq("is_available", true)
    .gt("stock_quantity", 0)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (minPrice) {
    query = query.gte("price", parseFloat(minPrice));
  }

  if (maxPrice) {
    query = query.lte("price", parseFloat(maxPrice));
  }

  if (isBio === "true") {
    query = query.eq("is_bio", true);
  }

  if (regionId) {
    query = query.eq("producer.region_id", regionId);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Check if user is a producer
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "producer") {
    return NextResponse.json(
      { error: "Seuls les producteurs peuvent ajouter des produits" },
      { status: 403 }
    );
  }

  // Get producer profile
  const { data: producerProfile } = await supabase
    .from("producer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!producerProfile) {
    return NextResponse.json(
      { error: "Profil producteur non trouve" },
      { status: 404 }
    );
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("products")
    .insert({
      producer_id: producerProfile.id,
      category_id: body.category_id,
      name: body.name,
      description: body.description,
      price: body.price,
      unit: body.unit,
      stock_quantity: body.stock_quantity,
      min_order_quantity: body.min_order_quantity || 1,
      is_bio: body.is_bio || false,
      images: body.images || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
