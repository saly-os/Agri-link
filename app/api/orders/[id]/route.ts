import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(
        *,
        product:products(name, images, unit)
      ),
      payment:payments(*),
      producer:producer_profiles(
        business_name,
        address,
        profile:profiles(full_name, phone)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;

  // Verify the user is the producer of this order
  const { data: order } = await supabase
    .from("orders")
    .select("producer:producer_profiles(user_id)")
    .eq("id", id)
    .single();

  if ((order?.producer as { user_id: string })?.user_id !== user.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If order is delivered, update payment status
  if (status === "delivered") {
    await supabase
      .from("payments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("order_id", id);

    // Update producer stats
    const { data: producerProfile } = await supabase
      .from("producer_profiles")
      .select("id, total_sales")
      .eq("user_id", user.id)
      .single();

    if (producerProfile) {
      await supabase
        .from("producer_profiles")
        .update({
          total_sales: (producerProfile.total_sales || 0) + 1,
        })
        .eq("id", producerProfile.id);
    }
  }

  return NextResponse.json({ data });
}
