import { env } from 'cloudflare:workers';
import { analyze } from '@/lib/analyze';
import { consumeQuota } from '@/lib/quota';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
    return analyze(request, {
        apiKey: env.GEMINI_API_KEY || '',
        model: env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        consumeQuota: () => consumeQuota(env.DB, env.AI_DAILY_LIMIT),
    });
}
