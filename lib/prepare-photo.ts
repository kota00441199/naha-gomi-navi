// 送信する画像を小さなJPEGにし、元の撮影メタデータを付けずに保存する。
export async function preparePhoto(file: File): Promise<File> {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.src = url;
    try {
        await image.decode();
        if (image.naturalWidth * image.naturalHeight > 24000000) {
            throw new Error('写真の解像度が大きすぎます。縮小してから選んでください。');
        }
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context)
            throw new Error('写真を準備できません。別のブラウザで試してください。');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const jpeg = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('写真をJPEGに変換できません。')), 'image/jpeg', 0.85));
        return new File([jpeg], 'item.jpg', { type: 'image/jpeg' });
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
