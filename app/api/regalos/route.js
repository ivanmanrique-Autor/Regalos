export const dynamic = 'force-dynamic';
async function relay(method, body) {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) return Response.json({error:'Configura APPS_SCRIPT_URL en el servidor con la URL /exec de Apps Script.'}, {status:500});
  try {
    const response = await fetch(url, {method, ...(body ? {body: JSON.stringify(body), headers:{'Content-Type':'text/plain;charset=utf-8'}} : {}), cache:'no-store', redirect:'follow'});
    const data = await response.json();
    if (!response.ok || data.error) return Response.json({error:data.error || 'Error de Google Sheets'}, {status:502});
    return Response.json(data);
  } catch { return Response.json({error:'No se pudo conectar con Apps Script. Revisa la URL y el despliegue.'}, {status:502}); }
}
export async function GET() { return relay('GET'); }
export async function POST(request) { try { return relay('POST', await request.json()); } catch { return Response.json({error:'Datos inválidos'}, {status:400}); } }
