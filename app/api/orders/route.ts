import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "consumer";

  let query = supabase
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
        profile:profiles(full_name, phone)
      ),
      consumer:profiles!orders_user_id_fkey(full_name, phone)
    `
    )
    .order("created_at", { ascending: false });

  if (role === "producer") {
    // Get orders for the producer
    const { data: producerProfile } = await supabase
      .from("producer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (producerProfile) {
      query = query.eq("producer_id", producerProfile.id);
    }
  } else {
    // Get orders for the consumer
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;

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
  const {
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    notes,
    payment_method,
    phone_number,
  } = body;

  // Get cart items
  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select(
      `
      *,
      product:products(
        id,
        name,
        price,
        producer_id,
        stock_quantity
      )
    `
    )
    .eq("user_id", user.id);

  if (cartError || !cartItems?.length) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }

  // Group items by producer
  const itemsByProducer: Record<string, typeof cartItems> = {};
  for (const item of cartItems) {
    const producerId = (item.product as { producer_id: string }).producer_id;
    if (!itemsByProducer[producerId]) {
      itemsByProducer[producerId] = [];
    }
    itemsByProducer[producerId].push(item);
  }

  const orders = [];

  // Create an order for each producer
  for (const [producerId, items] of Object.entries(itemsByProducer)) {
    const totalAmount = items.reduce((sum, item) => {
      const product = item.product as { price: number };
      return sum + product.price * item.quantity;
    }, 0);

    const deliveryFee = totalAmount >= 10000 ? 0 : 1000;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        producer_id: producerId,
        status: "pending",
        total_amount: totalAmount + deliveryFee,
        delivery_fee: deliveryFee,
        delivery_address,
        delivery_latitude,
        delivery_longitude,
        notes,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: (item.product as { id: string }).id,
      quantity: item.quantity,
      unit_price: (item.product as { price: number }).price,
      total_price:
        (item.product as { price: number }).price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      method: payment_method,
      amount: totalAmount + deliveryFee,
      status: "pending",
      phone_number,
    });

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // Update product stock
    for (const item of items) {
      const product = item.product as { id: string; stock_quantity: number };
      await supabase
        .from("products")
        .update({
          stock_quantity: product.stock_quantity - item.quantity,
        })
        .eq("id", product.id);
    }

    orders.push(order);
  }

  // Clear cart
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({ data: orders }, { status: 201 });
}
