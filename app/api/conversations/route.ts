import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("conversations")
    .select(
      `
      *,
      consumer:profiles!conversations_consumer_id_fkey(id, full_name, avatar_url),
      producer:producer_profiles(
        id,
        business_name,
        profile:profiles(full_name, avatar_url)
      )
    `
    )
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (profile?.role === "producer") {
    // Get producer profile id
    const { data: producerProfile } = await supabase
      .from("producer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (producerProfile) {
      query = query.eq("producer_id", producerProfile.id);
    }
  } else {
    query = query.eq("consumer_id", user.id);
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
  const { producer_id } = body;

  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("consumer_id", user.id)
    .eq("producer_id", producer_id)
    .single();

  if (existingConversation) {
    return NextResponse.json({ data: existingConversation });
  }

  // Create new conversation
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      consumer_id: user.id,
      producer_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
