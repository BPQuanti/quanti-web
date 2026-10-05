import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userMessage, contextSnapshot } = await req.json();

    const systemPrompt = `
      You are Quanti AI, a personalized fitness, health, and finance intelligence assistant inside the Quanti app.
      
      User's Live Metrics:
      - Daily Steps: ${contextSnapshot?.steps ?? "Not synced"}
      - Active Calories: ${contextSnapshot?.activeCalories ?? "Not synced"}
      - Location: ${contextSnapshot?.city ?? "Unknown location"}
      - Bank Status: ${contextSnapshot?.isBankConnected ? "Connected" : "Not connected"}
      Instructions:
      - Answer concisely, directly, and with an encouraging, witty tone.
      - Use their exact live stats when relevant.
      - Format key metrics clearly.
    `;

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await openAIResponse.json();
    const assistantReply = aiData.choices?.[0]?.message?.content || "Sorry, I couldn't process your metrics right now.";

    await supabaseClient.from("ai_chat_history").insert([
      {
        user_id: user.id,
        sender: "user",
        message: userMessage,
        context_snapshot: contextSnapshot,
      },
      {
        user_id: user.id,
        sender: "assistant",
        message: assistantReply,
        context_snapshot: contextSnapshot,
      },
    ]);

    return new Response(JSON.stringify({ reply: assistantReply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
