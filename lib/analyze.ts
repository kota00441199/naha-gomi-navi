import { Buffer } from 'node:buffer';
import { InputError, NO_STORE, parseUpload } from './upload';
import { CLASSIFY_PROMPT, RESPONSE_SCHEMA } from './classify-prompt';
import { isRecord, parseClassification } from './classification';
type Options = {
    apiKey: string;
    model: string;
    consumeQuota: () => Promise<boolean>;
    fetcher?: typeof fetch;
    timeoutMs?: number;
};
function failure(status: number, detail: string) {
    return Response.json({ detail }, { status, headers: NO_STORE });
}
export async function analyze(request: Request, options: Options): Promise<Response> {
    if (!options.apiKey.trim())
        return failure(503, '写真判定の接続設定が必要です。品目から調べる機能は使えます。');
    let upload: Awaited<ReturnType<typeof parseUpload>>;
    try {
        upload = await parseUpload(request);
    }
    catch (error) {
        return failure(error instanceof InputError ? error.status : 400, error instanceof InputError ? error.message : '送信内容を読み取れませんでした。');
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(options.model))
        return failure(503, 'AIのモデル設定を確認してください。');
    try {
        if (!await options.consumeQuota())
            return failure(429, '本日の写真判定の上限に達しました。品目から調べてください。');
    }
    catch {
        return failure(503, '写真判定の受付を準備できませんでした。品目から調べてください。');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 60000);
    try {
        const data = Buffer.from(await upload.file.arrayBuffer()).toString('base64');
        const response = await (options.fetcher || fetch)(`https://generativelanguage.googleapis.com/v1beta/models/${options.model}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': options.apiKey.trim() },
            signal: controller.signal,
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: CLASSIFY_PROMPT }] },
                contents: [{ role: 'user', parts: [
                            { inlineData: { mimeType: upload.mimeType, data } },
                            { text: '品物の補足データ: ' + (upload.notes || 'なし') },
                        ] }],
                generationConfig: { maxOutputTokens: 1024, responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
            }),
        });
        if (response.status === 429)
            return failure(429, 'AIの利用枠に達しました。少し待つか、品目から調べてください。');
        if (response.status === 401 || response.status === 403)
            return failure(502, 'AIの接続設定を確認してください。');
        if (response.status === 404)
            return failure(502, '指定したAIモデルを利用できません。');
        if (!response.ok)
            return failure(502, 'AIから回答を受け取れませんでした。時間をおいて試してください。');
        const body: unknown = await response.json();
        const candidate = isRecord(body) && Array.isArray(body.candidates) ? body.candidates[0] : null;
        if (!isRecord(candidate) || candidate.finishReason !== 'STOP')
            return failure(502, 'AIの回答が完了しませんでした。撮り直すか品目を選んでください。');
        const content = isRecord(candidate.content) ? candidate.content : null;
        const parts: unknown[] = content && Array.isArray(content.parts) ? content.parts : [];
        const raw = parts.flatMap(p => isRecord(p) && p.thought !== true && typeof p.text === 'string' ? [p.text] : []).join('');
        let classification;
        try {
            classification = parseClassification(JSON.parse(raw));
        }
        catch {
            classification = null;
        }
        if (!classification)
            return failure(502, 'AIの回答形式を確認できませんでした。品目から調べてください。');
        return Response.json({ classification, mode: 'gemini' }, { headers: NO_STORE });
    }
    catch {
        return failure(controller.signal.aborted ? 504 : 502, controller.signal.aborted ? '写真判定が時間切れになりました。品目から調べることもできます。' : 'AIとの通信に失敗しました。もう一度試してください。');
    }
    finally {
        clearTimeout(timer);
    }
}
