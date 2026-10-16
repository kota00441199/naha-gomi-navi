// 同時アクセスでも、サイト全体の上限を超えてAPIを呼び出さない。
export const QUOTA_SQL = `
INSERT INTO ai_daily_usage (day, used) VALUES (?, 1)
ON CONFLICT(day) DO UPDATE SET used = used + 1 WHERE used < ?
RETURNING used`;
export async function consumeQuota(db: D1Database | undefined, configuredLimit?: string): Promise<boolean> {
    if (!db)
        throw new Error('Usage database unavailable');
    const parsed = Number(configuredLimit || '20');
    const limit = Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 1000) : 20;
    const day = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const row = await db.prepare(QUOTA_SQL).bind(day, limit).first<{
        used: number;
    }>();
    return row !== null;
}
