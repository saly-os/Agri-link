import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const isBio = searchParams.get("is_bio");

  let query = supabase
    .from("producer_profiles")
    .select(
      `
      *,
      profile:profiles(full_name, avatar_url, phone),
      products:products(*)
    `
    )
    .eq("is_active", true)
    .order("rating", { ascending: false });

  if (isBio === "true") {
    query = query.eq("is_certified_bio", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
