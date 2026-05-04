import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TARGET_BASE =
  process.env.NEXT_PUBLIC_API_PROXY_TARGET?.trim().replace(/\/$/, "") ||
  "https://quvna.dominantsoftdevelopment.uz";

function buildTargetUrl(req: Request, pathParts: string[]) {
  const incoming = new URL(req.url);
  const target = new URL(`${TARGET_BASE}/${pathParts.join("/")}`);
  target.search = incoming.search;
  return target;
}

function buildForwardHeaders(req: Request) {
  const h = new Headers(req.headers);

  // Backend origin tekshiruvini o'tkazish uchun production origin o'rnatiladi
  h.set("origin", "https://quvna.dominantsoftdevelopment.uz");
  h.set("referer", "https://quvna.dominantsoftdevelopment.uz/");
  // Let fetch/undici set the correct host for the upstream.
  h.delete("host");
  // Body is re-streamed; content-length may become invalid.
  h.delete("content-length");

  // Ensure platform header exists (backend commonly relies on it).
  if (!h.has("x-platform")) h.set("X-Platform", "WEB");

  // Don't forward hop-by-hop headers.
  h.delete("connection");
  h.delete("keep-alive");
  h.delete("proxy-authenticate");
  h.delete("proxy-authorization");
  h.delete("te");
  h.delete("trailer");
  h.delete("transfer-encoding");
  h.delete("upgrade");

  return h;
}

async function proxy(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const url = buildTargetUrl(req, path);

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const upstream = await fetch(url, {
    method,
    headers: buildForwardHeaders(req),
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const resHeaders = new Headers(upstream.headers);
  // Keep cookies if backend uses them (auth/session flows).

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
