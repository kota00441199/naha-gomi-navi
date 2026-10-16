const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 64 * 1024;
export const NO_STORE = { 'Cache-Control': 'no-store' };
export class InputError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
// Content-Lengthがない場合も、受信する本文全体に上限を設ける。
async function readLimited(request: Request): Promise<Uint8Array> {
    const reader = request.body?.getReader();
    if (!reader)
        throw new InputError(400, '写真を選んでください。');
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            length += value.byteLength;
            if (length > MAX_REQUEST_BYTES) {
                await reader.cancel();
                throw new InputError(413, '写真は5MB以下にしてください。');
            }
            chunks.push(value);
        }
    }
    finally {
        reader.releaseLock();
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
    }
    return bytes;
}
function imageMime(bytes: Uint8Array): string | null {
    if (bytes.length < 12)
        return null;
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
    const webp = new TextDecoder().decode(bytes.subarray(0, 4)) === 'RIFF'
        && new TextDecoder().decode(bytes.subarray(8, 12)) === 'WEBP';
    return jpeg ? 'image/jpeg' : png ? 'image/png' : webp ? 'image/webp' : null;
}
export async function parseUpload(request: Request): Promise<{
    file: File;
    notes: string;
    mimeType: string;
}> {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data;')) {
        throw new InputError(415, '写真を選び、画面のボタンから送信してください。');
    }
    const bytes = await readLimited(request);
    const body = new Blob([bytes as BlobPart], { type: contentType });
    let form: FormData;
    try {
        form = await new Response(body).formData();
    }
    catch {
        throw new InputError(400, '写真の送信形式を読み取れません。もう一度送信してください。');
    }
    const file = form.get('file');
    const notes = form.get('notes') ?? '';
    if (!(file instanceof File) || form.getAll('file').length !== 1) {
        throw new InputError(422, '写真を1枚選んでください。');
    }
    if (typeof notes !== 'string' || [...notes].length > 300 || form.getAll('notes').length > 1) {
        throw new InputError(422, '補足は300文字以内で入力してください。');
    }
    if (file.size > MAX_FILE_BYTES)
        throw new InputError(413, '写真は5MB以下にしてください。');
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const mimeType = imageMime(header);
    if (!mimeType) {
        throw new InputError(400, '写真を読み取れません。JPEG・PNG・WebPの写真を選んでください。');
    }
    return { file, notes, mimeType };
}
