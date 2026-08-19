// supabase/functions/create-checkout/index.ts
// Crea un registro "pending" en la BD y una sesión de pago de Stripe.
// Se despliega como Supabase Edge Function (Deno).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@16.2.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!  // permisos totales, solo en el servidor
);

const SITE_URL = Deno.env.get("SITE_URL")!; // p.ej. https://tudominio.com

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { title, description, lat, lng, image_url, occurred_at } = body;

    // Validación básica en servidor (nunca confiar solo en el cliente)
    if (!title || String(title).length < 3 || String(title).length > 80) {
      return json({ error: "Título inválido" }, 400);
    }
    if (!description || String(description).length < 3 || String(description).length > 1000) {
      return json({ error: "Descripción inválida" }, 400);
    }
    const latNum = Number(lat), lngNum = Number(lng);
    if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      return json({ error: "Latitud inválida" }, 400);
    }
    if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return json({ error: "Longitud inválida" }, 400);
    }

    // 1. Insertar el caso como "pending"
    const { data: row, error: insertError } = await supabase
      .from("sightings")
      .insert({
        title, description, lat: latNum, lng: lngNum,
        image_url: image_url || null,
        occurred_at: occurred_at || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Crear la sesión de pago de Stripe (1 EUR, pago único)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "Verificación y publicación de informe" },
          unit_amount: 100, // 1,00 €
        },
        quantity: 1,
      }],
      metadata: { sighting_id: row.id },
      success_url: `${SITE_URL}?success=true`,
      cancel_url: `${SITE_URL}?canceled=true`,
    });

    // 3. Guardar el id de sesión para poder relacionarlo en el webhook
    await supabase
      .from("sightings")
      .update({ stripe_session_id: session.id })
      .eq("id", row.id);

    return json({ url: session.url }, 200);
  } catch (err) {
    console.error(err);
    return json({ error: "No se pudo crear el pago" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
