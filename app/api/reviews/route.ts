import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const producerId = searchParams.get("producer_id");

  if (!producerId) {
    return NextResponse.json(
      { error: "producer_id requis" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      reviewer:profiles(full_name, avatar_url)
    `
    )
    .eq("producer_id", producerId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { order_id, producer_id, rating, comment } = body;

  // Check if order exists and belongs to user
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", order_id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Commande non trouvee" }, { status: 404 });
  }

  if (order.status !== "delivered") {
    return NextResponse.json(
      { error: "Vous ne pouvez noter que les commandes livrees" },
      { status: 400 }
    );
  }

  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", order_id)
    .single();

  if (existingReview) {
    return NextResponse.json(
      { error: "Vous avez deja note cette commande" },
      { status: 400 }
    );
  }

  // Create review
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      order_id,
      reviewer_id: user.id,
      producer_id,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update producer rating
  const { data: allReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("producer_id", producer_id);

  if (allReviews) {
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await supabase
      .from("producer_profiles")
      .update({
        rating: Math.round(avgRating * 10) / 10,
        total_reviews: allReviews.length,
      })
      .eq("id", producer_id);
  }

  return NextResponse.json({ data }, { status: 201 });
}
