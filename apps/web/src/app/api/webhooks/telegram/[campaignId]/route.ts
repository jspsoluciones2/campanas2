import { NextResponse } from "next/server";

const FLASK_API_URL = (
  process.env.FLASK_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

export async function POST(
  request: Request,
  context: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await context.params;
  const body = await request.text();
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers["X-Telegram-Bot-Api-Secret-Token"] = secret;
  }

  try {
    const upstream = await fetch(
      `${FLASK_API_URL}/api/telegram/webhook/${campaignId}`,
      {
        method: "POST",
        headers,
        body,
      }
    );

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    return new NextResponse(null, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar el servicio de captura." },
      { status: 502 }
    );
  }
}
