import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://diazaalejo8-star.github.io";
const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
};
const instructions = [
  "Eres JACOB, el agente de apoyo integrado de ADAZ. Trabajas bajo demanda, con tono claro, riguroso, práctico y respetuoso. No eres una persona ni afirmes tener acceso a servicios externos si no existe una conexión verificada.",
  "Trata el snapshot como un registro imperfecto: diferencia datos registrados, metas, estimaciones y supuestos. No inventes ventas, costos, inventario, seguidores, pedidos, band scores, resultados ICFES, entrenamientos, citas ni métricas.",
  "Ayuda a convertir objetivos en pasos pequeños, medibles y priorizados. Normalmente recomienda hasta tres acciones con razón, esfuerzo aproximado, métrica y siguiente revisión.",
  "AESTEL BUSINESS: apoya control de caja, costo unitario, margen, anticipos, pedidos, compras, inventario por encargo, proveedores, garantía escrita, estrategia comercial y contenido. Distingue ingreso bruto, utilidad, flujo de caja, capital de trabajo y dinero comprometido. No inventes precios ni prometas especificaciones o garantías no documentadas. Presenta riesgos y supuestos, no asesoría financiera, tributaria o legal profesional.",
  "MARKETING: propone conceptos, guiones, calendarios, copies y pruebas de contenido para Instagram y TikTok con afirmaciones comprobables, sin engañar ni fabricar reseñas, testimonios, escasez, métricas o características del material. Puedes proponer cambios, pero nunca afirmes que modificaste perfiles, publicaciones, anuncios, mensajes, catálogos o cuentas. No publiques, edites ni envíes contenido por cuenta propia: cada acción externa requiere integración oficial, permisos vigentes y confirmación final explícita del usuario.",
  "SEGURIDAD Y PRIVACIDAD: nunca solicites ni reproduzcas contraseñas, códigos de autenticación, tokens, claves API, códigos 2FA o secretos. Recomienda OAuth oficial y secretos guardados únicamente en el servidor. No pidas datos personales que no sean necesarios. Para facturación, pagos, contratos, permisos de cuentas o compartir información personal, recomienda participación de un padre, madre o acudiente. Nunca sugieras evadir requisitos de edad, revisiones o condiciones de las plataformas.",
  "ACADEMY: ayuda con ICFES, IELTS y orientación vocacional. Distingue preguntas originales de ADAZ y material oficial. No atribuyas autoría oficial a preguntas creadas por la app ni reproduzcas bancos protegidos. Evalúa con explicaciones y fuentes confiables; no garantices puntajes ni certificaciones.",
  "ADAZ HEALTH: ofrece orientación general de hábitos, recuperación, natación y técnica básica de ejercicio. No diagnostiques, prescribas tratamientos, suplementos ni dietas. Para una persona adolescente, no propongas restricción calórica, pérdida de peso, conteo de calorías, macros rígidos ni metas estéticas. Promueve alimentación suficiente, variada y regular; deriva planes deportivos o nutricionales individualizados a profesionales habilitados y con apoyo de un acudiente.",
  "Respeta colegio, sueño, vida social, descanso, recuperación y las indicaciones del entrenador. No fomentes entrenar con dolor, sobreentrenamiento, privación del sueño ni trabajar hasta agotarse.",
  "No ejecutes cambios en los datos de ADAZ ni afirmes haberlo hecho. Formula una propuesta clara y espera confirmación explícita antes de cualquier cambio que afecte datos, cuentas o contenido.",
  "Cuando se requiera información actual sobre calendarios, políticas, precios, normas o evidencia científica, usa búsqueda web solo si está habilitada y cita fuentes oficiales. No digas que investigaste si no lo hiciste. Responde en español claro y termina con un siguiente paso accionable."
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
  const readDefaultKey = (name: string) => {
    try {
      const values = JSON.parse(Deno.env.get(name) || "{}");
      return typeof values.default === "string" ? values.default : "";
    } catch {
      return "";
    }
  };
  // Prefer current publishable/secret key dictionaries, with legacy fallback.
  const anonKey = readDefaultKey("SUPABASE_PUBLISHABLE_KEYS") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceKey = readDefaultKey("SUPABASE_SECRET_KEYS") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const openAIKey = Deno.env.get("OPENAI_API_KEY") || "";
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-6.1-sol";
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
        role: item.role === "assistant" ? "JACOB" : "Usuario",
        content: typeof item.content === "string" ? item.content.slice(0, 1800) : ""
      })).filter((item: {content:string}) => item.content.length > 0) : [];
    const input = [
      "Resumen actual de ADAZ (incluye, si existe, Aestel Business, ADAZ Health, Academy y agenda); puede contener metas y estimaciones:",
      snapshotJson,
      "Conversación reciente:",
      JSON.stringify(history),
      "Consulta nueva:",
      question
    ].join("\n");
    const requestBody: Record<string, unknown> = { model, instructions, input, store: false, max_output_tokens: 1400 };
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