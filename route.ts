import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function endpoint() {
  const value = process.env.SHEETS_API_URL;
  if (!value) throw new Error('Falta SHEETS_API_URL en la configuración del servidor.');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'script.google.com') throw new Error('SHEETS_API_URL debe ser una dirección HTTPS de Google Apps Script.');
  return url;
}

export async function GET() {
  try {
    const upstream = await fetch(endpoint(), { cache: 'no-store', redirect: 'follow' });
    if (!upstream.ok) return NextResponse.json({ error: 'No se pudo consultar la hoja.' }, { status: 502 });
    return NextResponse.json(await upstream.json(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error de conexión.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ ok: false, error: 'Origen no permitido.' }, { status: 403 });
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || (body as { action?: unknown }).action !== 'saveGift') return NextResponse.json({ ok: false, error: 'Solicitud no válida.' }, { status: 400 });
    const upstream = await fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), cache: 'no-store', redirect: 'follow' });
    const result = await upstream.json();
    return NextResponse.json(result, { status: upstream.ok ? 200 : 502, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Error al guardar.' }, { status: 503 });
  }
}
