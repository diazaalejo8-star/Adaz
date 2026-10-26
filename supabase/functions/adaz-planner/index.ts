import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://diazaalejo8-star.github.io";
const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
};
const instructions = [
  "Eres ADAZ Copiloto, un asistente de planificación personal práctico, honesto y respetuoso.",
  "Trata el estado de ADAZ como un registro imperfecto: distingue hechos registrados, objetivos, estimaciones y suposiciones. No inventes horarios, puntuaciones, ventas ni resultados.",
  "Convierte objetivos en pasos pequeños y observables. Recomienda normalmente un máximo de tres prioridades y explica por qué, el tiempo orientativo y cómo medir el avance.",
  "Respeta colegio, descanso, energía y la carga de entrenamiento. No fomentes sobreentrenamiento, privación del sueño, dietas restrictivas, vergüenza ni trabajar hasta agotarse.",
  "Para entrenamientos respeta el plan vigente del entrenador; no diagnostiques ni sugieras entrenar a través del dolor. En asuntos importantes de salud, finanzas o trámites, distingue orientación general de asesoría profesional.",
  "Si faltan datos, reconoce la incertidumbre y pide el mínimo dato necesario. A veces descansar o reducir el plan es la mejor decisión.",
  "No afirmes que sincronizaste servicios o creaste alarmas si no hay confirmación. No tienes acceso a la cuenta de ChatGPT del usuario ni a Spotify salvo los datos enviados expresamente.",
  "Cuando haga falta información vigente sobre calendarios oficiales, reglas, precios o evidencia científica, consulta fuentes web oficiales si la herramienta está habilitada y enlaza las fuentes utilizadas. No afirmes haber investigado si no usaste búsqueda. Responde en español claro, sin sermones, y termina con un siguiente paso accionable."
].join("\n");

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (request.method === "OPTIONS") return new Response("ok", { headers: { ...CORS, "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN } });
  if (request.method !== "POST") return respond(405, { error: "Use POST." });
  if (origin && origin !== ALLOWED_ORIGIN) return respond(403, { error: "Origin not allowed." });
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return respond(401, { error: "Sign in to ADAZ before using the AI copilot." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const openAIKey = Deno.env.get("OPENAI_API_KEY") || "";
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-6-astra";
  if (!supabaseUrl || !anonKey || !serviceKey || !openAIKey) return respond(500, { error: "Missing server-side secrets. Verify Supabase environment settings and OPENAI_API_KEY." });

  try {
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } }
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(authorization.slice(7));
    if (userError || !userData.user) return respond(401, { error: "The session is invalid or expired. Sign in again." });
    const userId = userData.user.id;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: usageError } = await admin.from("adaz_ai_usage")
      .select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", hourAgo);
    if (usageError) return respond(500, { error: "Could not check AI usage. Confirm that supabase/schema.sql was applied." });
    if ((count || 0) >= 8) return respond(429, { error: "ADAZ allows up to 8 AI consultations per user per hour. Try later." });
    const { error: insertError } = await admin.from("adaz_ai_usage").insert({ user_id: userId });
    if (insertError) return respond(500, { error: "Could not record AI usage." });

    const body = await request.json().catch(() => ({}));
    const question = typeof body.question === "string" ? body.question.trim().slice(0, 3000) : "";
    if (!question) return respond(400, { error: "Add a question for the copilot." });
    const snapshot = body.snapshot && typeof body.snapshot === "object" ? body.snapshot : {};
    const snapshotJson = JSON.stringify(snapshot);
    if (snapshotJson.length > 80000) return respond(413, { error: "Snapshot too large. Export a backup and reduce old records before retrying." });
    const history = Array.isArray(body.history) ? body.history.slice(-8).filter((item: unknown) => item && typeof item === "object")
      .map((item: Record<string, unknown>) => ({
        role: item.role === "assistant" ? "ADAZ Copiloto" : "Usuario",
        content: typeof item.content === "string" ? item.content.slice(0, 1800) : ""
      })).filter((item: {content:string}) => item.content.length > 0) : [];
    const input = [
      "Resumen actual de ADAZ; puede contener metas y estimaciones:",
      snapshotJson,
      "Conversación reciente:",
      JSON.stringify(history),
      "Consulta nueva:",
      question
    ].join("\n");
    const requestBody: Record<string, unknown> = { model, instructions, input, store: false };
    // Live web search is optional to keep the default cost predictable.
    if (Deno.env.get("ADAZ_ENABLE_WEB_SEARCH") === "true") {
      requestBody.tools = [{ type: "web_search" }];
      requestBody.tool_choice = "auto";
    }
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": "Bearer " + openAIKey, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof result.error?.message === "string" ? result.error.message : "OpenAI API request failed.";
      return respond(response.status === 429 ? 429 : 502, { error: message });
    }
    const answer = typeof result.output_text === "string" ? result.output_text : (Array.isArray(result.output)
      ? result.output.flatMap((item: Record<string, unknown>) => Array.isArray(item.content) ? item.content : [])
        .filter((content: Record<string, unknown>) => content.type === "output_text" && typeof content.text === "string")
        .map((content: Record<string, unknown>) => content.text as string).join("\n") : "");
    if (!answer.trim()) return respond(502, { error: "The AI response contained no text. Try a shorter question." });
    return respond(200, { answer, model });
  } catch (error) {
    return respond(500, { error: error instanceof Error ? error.message : "Unexpected server error." });
  }
});