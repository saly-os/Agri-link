import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporte. Utilisez JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier ne doit pas depasser 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Storage error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'upload" },
        { status: 500 }
      );
    }

    // Try to create a signed URL (valid for 7 days). Fall back to public URL if needed.
    const { data: signedData, error: signedError } = await supabase.storage
      .from("products")
      .createSignedUrl(data.path, 60 * 60 * 24 * 7);

    if (signedError) {
      console.warn("Could not create signed URL, falling back to public URL:", signedError);
    }

    const signedUrl = (signedData as any)?.signedURL || (signedData as any)?.signedUrl;

    const publicResult = supabase.storage.from("products").getPublicUrl(data.path);
    const publicUrl = (publicResult as any)?.data?.publicUrl;

    const url = signedUrl || publicUrl;

    return NextResponse.json({
      data: {
        url,
        path: data.path,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
