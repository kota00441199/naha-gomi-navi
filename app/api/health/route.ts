import { env } from "cloudflare:workers";
export const dynamic = "force-dynamic";
export function GET() {
  // 設定の存在確認。キーの有効性やGoogleの稼働確認とは別。
  return Response.json(
    { configured: !!env.GEMINI_API_KEY && !!env.DB },
    { headers: { "Cache-Control": "no-store" } },
  );
}
