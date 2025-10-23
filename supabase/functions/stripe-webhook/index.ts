import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (webhookSecret && signature) {
      const crypto = await import("node:crypto");
      const timestamp = signature.split(",").find((s) => s.startsWith("t="))?.split("=")[1];
      const receivedSig = signature.split(",").find((s) => s.startsWith("v1="))?.split("=")[1];

      const signedPayload = `${timestamp}.${body}`;
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(signedPayload)
        .digest("hex");

      if (receivedSig !== expectedSig) {
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const reservationId = session.metadata.reservation_id;
      const paymentIntentId = session.payment_intent;

      if (reservationId) {
        const { error } = await supabase
          .from("reservations")
          .update({
            status: "confirmed",
            stripe_payment_intent: paymentIntentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reservationId);

        if (error) {
          console.error("Error updating reservation:", error);
          throw error;
        }

        const { data: reservation } = await supabase
          .from("reservations")
          .select("object_id")
          .eq("id", reservationId)
          .single();

        if (reservation) {
          await supabase
            .from("objects")
            .update({
              status: "rented",
              updated_at: new Date().toISOString(),
            })
            .eq("id", reservation.object_id);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
