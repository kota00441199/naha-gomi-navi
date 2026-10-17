'use client';
import { Camera, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
type Props = {
    preview: string;
    busy: boolean;
    onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
    onCapture: (file: File) => void;
    onInvalid: () => void;
};
export function PhotoInput({ preview, busy, onSelect, onCapture, onInvalid }: Props) {
    const video = useRef<HTMLVideoElement>(null);
    const stream = useRef<MediaStream | null>(null);
    const attempt = useRef(0);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [ready, setReady] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [showPermissionHelp, setShowPermissionHelp] = useState(false);
    function stopCamera() {
        attempt.current += 1;
        stream.current?.getTracks().forEach(track => track.stop());
        stream.current = null;
        if (video.current) video.current.srcObject = null;
        setCameraOpen(false);
        setReady(false);
        setCapturing(false);
    }
    useEffect(() => {
        const stopWhenHidden = () => { if (document.hidden) stopCamera(); };
        document.addEventListener('visibilitychange', stopWhenHidden);
        window.addEventListener('pagehide', stopCamera);
        return () => {
            document.removeEventListener('visibilitychange', stopWhenHidden);
            window.removeEventListener('pagehide', stopCamera);
            attempt.current += 1;
            stream.current?.getTracks().forEach(track => track.stop());
        };
    }, []);
    async function openCamera() {
        stopCamera();
        setCameraError('');
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
            setCameraError('この画面ではカメラを開けません。HTTPSのURLをChromeやSafariで開くか、「写真を選ぶ」を使ってください。');
            return;
        }
        const current = attempt.current;
        setCameraOpen(true);
        try {
            const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1600 }, height: { ideal: 1200 } } });
            if (attempt.current !== current) {
                media.getTracks().forEach(track => track.stop());
                return;
            }
            stream.current = media;
            if (!video.current) throw new Error('Video unavailable');
            video.current.srcObject = media;
            await video.current.play();
        } catch (error) {
            if (attempt.current !== current) return;
            stopCamera();
            const name = error instanceof DOMException ? error.name : '';
            if (name === 'NotAllowedError') setShowPermissionHelp(true);
            setCameraError(name === 'NotAllowedError'
                ? 'カメラを使うにはブラウザのカメラ許可が必要です。許可してからもう一度押してください。「写真を選ぶ」も使えます。'
                : name === 'NotFoundError' ? 'カメラが見つかりません。「写真を選ぶ」を使ってください。'
                : 'カメラを開けませんでした。他のカメラアプリを閉じて再度試すか、「写真を選ぶ」を使ってください。');
        }
    }
    async function capturePhoto() {
        const element = video.current;
        if (!element || !ready || capturing || busy) return;
        const current = attempt.current;
        setCapturing(true);
        setCameraError('');
        try {
            const canvas = document.createElement('canvas');
            const scale = Math.min(1, 1600 / Math.max(element.videoWidth, element.videoHeight));
            canvas.width = Math.max(1, Math.round(element.videoWidth * scale));
            canvas.height = Math.max(1, Math.round(element.videoHeight * scale));
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas unavailable');
            context.drawImage(element, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Capture failed')), 'image/jpeg', 0.85));
            if (attempt.current !== current) return;
            stopCamera();
            onCapture(new File([blob], 'camera.jpg', { type: 'image/jpeg' }));
        } catch {
            if (attempt.current !== current) return;
            setCapturing(false);
            setCameraError('撮影できませんでした。もう一度撮影するか、「写真を選ぶ」を使ってください。');
        }
    }
    return <>
    <div className={`photo-area ${preview || cameraOpen ? 'has-photo' : ''}`}>
      {cameraOpen ? <video ref={video} autoPlay muted playsInline aria-label="撮影する品物のカメラ映像" onLoadedData={() => setReady(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', minHeight: 0, background: '#142019' }}/>
        : preview ? <img src={preview} alt="今回判定する品物" onError={onInvalid}/> : <div>
        <div className="camera-circle"><Camera size={34}/></div>
        <p className="photo-title">品物を1つ、明るい場所で。</p><p>全体が入るように撮ってみよう</p>
      </div>}
    </div>
    {cameraOpen && <>
      <p className="fine" role="status">{ready ? '品物を画面に入れて「撮影する」を押してください。' : 'カメラの許可・起動を待っています。'}</p>
      <div className="photo-buttons">
        <button type="button" className="button green" onClick={capturePhoto} disabled={!ready || capturing || busy}><Camera size={18}/>{capturing ? '写真を準備中…' : '撮影する'}</button>
        <button type="button" className="button outline" onClick={stopCamera}>カメラを閉じる</button>
      </div>
    </>}
    <div className="photo-buttons">
      <button type="button" className="button green" onClick={openCamera} disabled={busy || cameraOpen}><Camera size={18}/> カメラで撮る</button>
      <label className={`button outline ${busy ? 'disabled' : ''}`}><Upload size={18}/> 写真を選ぶ
        <input type="file" accept="image/jpeg,image/png,image/webp" onClick={() => { stopCamera(); setCameraError(''); }} onChange={onSelect} disabled={busy} className="visually-hidden"/>
      </label>
    </div>
    {cameraError && <p className="error" role="alert">{cameraError}</p>}
    <button type="button" className="button outline" style={{ marginTop: 12, width: '100%' }} aria-expanded={showPermissionHelp} aria-controls="camera-permission-help" onClick={() => setShowPermissionHelp(value => !value)}>カメラの許可・設定方法</button>
    {showPermissionHelp && <section id="camera-permission-help" className="notice" aria-labelledby="camera-permission-heading" style={{ lineHeight: 1.8 }}>
      <h3 id="camera-permission-heading">カメラを許可するには</h3>
      <p>設定画面は、このページから直接開けません。次の手順で変更してください。</p>
      <p><strong>シャオミなどのAndroid・Chrome</strong></p>
      <ol style={{ paddingLeft: '1.5em', listStyle: 'decimal' }}>
        <li>Chromeの右上の「⋮」から「設定」を開く。</li>
        <li>「サイトの設定」→「カメラ」を開き、カメラの使用を要求できる設定にする。</li>
        <li>「ブロック中」にこのサイトがあれば、選んで「許可」にする。</li>
        <li>このページに戻り、下の「許可したので、もう一度開く」を押す。</li>
      </ol>
      <p>まだ開けない場合は、スマホ本体の「設定」→「アプリ」→「Chrome」→「権限」→「カメラ」で、使用中のアクセスを許可してください。項目名は機種によって異なります。</p>
      <p>LINEなどのアプリ内で開いている場合は、メニューからChromeなどのブラウザで開き直してください。</p>
      <p><a href="https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&amp;hl=ja" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Chrome公式の設定ガイドを開く（別タブ）</a></p>
      <button type="button" className="button green" disabled={busy || cameraOpen} onClick={openCamera}>許可したので、もう一度開く</button>
      <p>設定を変更できない場合は「写真を選ぶ」も使えます。</p>
    </section>}
    <p className="fine">JPEG・PNG・WebP ／ 元写真20MiB・2400万画素まで。送信前に長辺1600px以下へ縮小します。撮影した写真は、判定ボタンを押すまで送信されません。</p>
  </>;
}
