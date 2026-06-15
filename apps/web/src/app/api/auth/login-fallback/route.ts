import { NextResponse } from "next/server";

/** Redirige envíos nativos del login sin exponer credenciales en la URL. */
export async function POST(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
