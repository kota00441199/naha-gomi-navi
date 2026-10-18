import { useState } from 'react';
import { Link } from 'react-router-dom';
import AutomationPanel from './AutomationPanel';
import './auto-input.css';

function savedItems(): {name: string; quantity: number}[] | null {
  try {
    const raw = localStorage.getItem('waste-checklist-items');
    if (raw === null) return null;
    const items: unknown = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    const grouped = new Map<string, number>();
    for (const item of items) {
      if (!item || item.collected || typeof item.name !== 'string' || !item.name.trim()) continue;
      grouped.set(item.name, (grouped.get(item.name) || 0) + 1);
    }
    return Array.from(grouped, ([name, quantity]) => ({name, quantity}));
  } catch { return []; }
}

export default function AutoInputPage() {
  const [entries] = useState(savedItems);
  const [schedule] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem('waste-pickup-schedule') || '{}'); return {date: typeof v.date === 'string' ? v.date : '', place: typeof v.place === 'string' ? v.place : ''}; }
    catch { return {date: '', place: ''}; }
  });
  return <main className="auto-input-page">
    <Link to="/">← すっきり回収ナビに戻る</Link>
    <section className="auto-input-hero">
      <span className="auto-input-badge">那覇市・入力サポート / 試験版</span>
      <h1>自動申し込み</h1>
      <p>住所・品目・希望日をまとめて設定し、公式受付への入力をお手伝いします。</p>
      <p>メール認証と最終申し込み・支払いは、ご本人が内容を確認して行ってください。</p>
      <ol><li>住所と申込品目を設定</li><li>公式メールで認証</li><li>入力結果を確認して申し込み</li></ol>
    </section>
    {entries !== null && <p className="import-note">前のページの最新の品目・数量を反映しています。搬出済みの品目は除いています。公式品目名を確認してください。</p>}
    <AutomationPanel entries={entries} schedule={schedule} />
  </main>;
}
