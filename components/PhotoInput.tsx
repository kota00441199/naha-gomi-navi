'use client';
import { Camera, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
type Props = {
    preview: string;
    busy: boolean;
    onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
    onInvalid: () => void;
};
export function PhotoInput({ preview, busy, onSelect, onInvalid }: Props) {
    return <>
    <div className={`photo-area ${preview ? 'has-photo' : ''}`}>
      {preview ? <img src={preview} alt="今回判定する品物" onError={onInvalid}/> : <div>
        <div className="camera-circle"><Camera size={34}/></div>
        <p className="photo-title">品物を1つ、明るい場所で。</p><p>全体が入るように撮ってみよう</p>
      </div>}
    </div>
    <div className="photo-buttons">
      <label className={`button green ${busy ? 'disabled' : ''}`}><Camera size={18}/> カメラで撮る
        <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={onSelect} disabled={busy} className="visually-hidden"/>
      </label>
      <label className={`button outline ${busy ? 'disabled' : ''}`}><Upload size={18}/> 写真を選ぶ
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onSelect} disabled={busy} className="visually-hidden"/>
      </label>
    </div>
    <p className="fine">JPEG・PNG・WebP ／ 5MBまで。カメラの開き方は端末によって異なります。</p>
  </>;
}
