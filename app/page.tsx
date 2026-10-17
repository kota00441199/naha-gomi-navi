'use client';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowRight, CircleHelp, Leaf, LoaderCircle, Recycle, ShieldCheck } from 'lucide-react';
import { PhotoInput } from '@/components/PhotoInput';
import { RuleGuide } from '@/components/RuleGuide';
import { ItemIcon } from '@/components/ItemIcon';
import { ITEM_IDS, RULES, SOURCES, isItemId, type ItemId } from '@/lib/rules';
import { isRecord, parseClassification, type Classification } from '@/lib/classification';
import { MAX_SOURCE_BYTES, preparePhoto } from '@/lib/prepare-photo';
export default function App() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [notes, setNotes] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [connection, setConnection] = useState<'checking' | 'ready' | 'unavailable'>('checking');
    const [classification, setClassification] = useState<Classification | null>(null);
    const [selected, setSelected] = useState<ItemId | null>(null);
    const [origin, setOrigin] = useState<'ai' | 'manual'>('manual');
    const [revision, setRevision] = useState(0);
    const [connectionAttempt, setConnectionAttempt] = useState(0);
    const pending = useRef<AbortController | null>(null);
    const [cancelled, setCancelled] = useState(false);
    useEffect(() => () => {
        pending.current?.abort();
        pending.current = null;
    }, []);
    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        setConnection('checking');
        const timer = window.setTimeout(() => controller.abort(), 5000);
        fetch('/api/health', { signal: controller.signal })
            .then(async (r) => { if (!r.ok)
            throw new Error(); const d = await r.json(); if (active) setConnection(!controller.signal.aborted && isRecord(d) && d.configured === true ? 'ready' : 'unavailable'); })
            .catch(() => { if (active) setConnection('unavailable'); })
            .finally(() => window.clearTimeout(timer));
        return () => { active = false; controller.abort(); window.clearTimeout(timer); };
    }, [connectionAttempt]);
    useEffect(() => {
        if (!file) {
            setPreview('');
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    function clearResult() { setClassification(null); setSelected(null); setError(''); setCancelled(false); }
    function cancelAnalysis() {
        pending.current?.abort();
        pending.current = null;
        setBusy(false);
        clearResult();
        setCancelled(true);
    }
    function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
        const photo = event.target.files?.[0];
        event.target.value = '';
        receivePhoto(photo);
    }
    function receivePhoto(photo: File | undefined) {
        if (!photo)
            return;
        clearResult();
        setFile(null);
        if (photo.size > MAX_SOURCE_BYTES) {
            setError('元の写真は20MiB以下にしてください。');
            return;
        }
        if (!/\.(jpe?g|png|webp)$/i.test(photo.name)) {
            setError('JPEG・PNG・WebPを選んでください。HEICはJPEGに変換してください。');
            return;
        }
        setFile(photo);
    }
    function choose(id: ItemId, source: 'ai' | 'manual') {
        if (source === 'manual' && pending.current) cancelAnalysis();
        setSelected(id);
        setOrigin(source);
        setRevision(n => n + 1);
        if (source === 'manual') {
            setClassification(null);
            setError('');
        }
        window.requestAnimationFrame(() => document.getElementById('result-panel')?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start',
        }));
    }
    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!file || pending.current || connection !== 'ready')
            return;
        clearResult();
        setBusy(true);
        const controller = new AbortController();
        pending.current = controller;
        const timer = window.setTimeout(() => controller.abort(), 75000);
        try {
            const form = new FormData();
            const photo = await preparePhoto(file, controller.signal);
            if (pending.current !== controller) return;
            controller.signal.throwIfAborted();
            form.append('file', photo);
            form.append('notes', notes);
            const response = await fetch('/api/analyze', { method: 'POST', body: form, signal: controller.signal });
            const body: unknown = await response.json().catch(() => null);
            if (pending.current !== controller) return;
            controller.signal.throwIfAborted();
            if (!response.ok)
                throw new Error(isRecord(body) && typeof body.detail === 'string' ? body.detail : '送信できませんでした。');
            const value = isRecord(body) && body.mode === 'gemini' ? parseClassification(body.classification) : null;
            if (!value)
                throw new Error('回答の形式を確認できませんでした。');
            setClassification(value);
            if (isItemId(value.itemId))
                choose(value.itemId, 'ai');
        }
        catch (e) {
            if (pending.current !== controller) return;
            setError(e instanceof Error && e.name === 'AbortError' ? '時間切れになりました。品目から調べることもできます。' : e instanceof Error ? e.message : '通信に失敗しました。');
        }
        finally {
            window.clearTimeout(timer);
            if (pending.current === controller) {
                pending.current = null;
                setBusy(false);
            }
        }
    }
    return <div className="site-shell">
    <header className="topbar"><a className="brand" href="/"><span className="brand-icon"><Recycle size={24}/></span>那覇ごみナビ</a><span className="location"><span /> 那覇市の家庭ごみ</span></header>
    <main>
      <section className="hero"><div><p className="eyebrow"><Leaf size={15}/> 島の暮らしに、小さなひと手間。</p><h1>捨てる前に、<br /><em>ひと確認。</em></h1><p className="hero-copy">写真から品物の候補を見つけて、<br />那覇市のルールで、出し方を確認しよう。</p></div>
        <div className="hero-art" aria-hidden="true"><span className="art-ring"/><div className="art-card one"><ItemIcon id="pet"/><span>みつける</span></div><div className="art-card two"><ItemIcon id="cardboard"/><span>たしかめる</span></div><span className="art-leaf"><Leaf size={30}/></span><p>ひとつずつ、資源へ。</p></div>
      </section>
      <div className="scope-note"><ShieldCheck size={19}/><p><strong>6種類から始める分別サポート</strong>　AIの候補を実物と照らし合わせてから、公式ルールを表示します。那覇市の公式アプリではありません。</p></div>
      <div className="workspace">
        <section className="panel"><div className="section-heading"><span className="step">01</span><div><h2>写真から調べる</h2><p>まずは、品物を1つだけ</p></div></div>
          <form onSubmit={submit}>
            <PhotoInput preview={preview} busy={busy} onSelect={selectPhoto} onCapture={receivePhoto} onInvalid={() => { setFile(null); setError('写真を表示できません。別の画像を選んでください。'); }}/>
            <label className="field-label" htmlFor="notes">品物の補足 <span>任意</span></label>
            <textarea id="notes" rows={2} value={notes} maxLength={300} disabled={busy} placeholder="例：飲み終えたジュースの容器です" onChange={e => { setNotes(e.target.value); clearResult(); }}/>
            <button className="button analyze wide" type="submit" disabled={!file || busy || connection !== 'ready'}>{busy ? <><LoaderCircle className="spin" size={18}/> 写真を確認しています…</> : <>この写真で候補を探す <ArrowRight size={18}/></>}</button>
            <p className="connection" role="status">{connection === 'checking' ? '写真判定の接続を確認中…' : connection === 'ready' ? '写真判定の接続設定あり' : '写真判定に接続できません。下の品目選択は使えます。'}</p>
            {connection === 'unavailable' && <button type="button" className="button outline wide" onClick={() => { setConnection('checking'); setConnectionAttempt(n => n + 1); }}>接続を再確認</button>}
            <p className="fine">送信すると写真と補足をGoogleのGemini APIへ送ります。このアプリには画像や回答を保存しません。</p>
          </form>
        </section>
        <section id="result-panel" className="panel result-panel" aria-busy={busy}><div className="section-heading"><span className="step">02</span><div><h2>確認して、分別する</h2><p>材質や状態は、実物でチェック</p></div></div>
          {busy && <div className="working" role="status"><LoaderCircle className="spin" size={28}/><p>品物の候補を探しています。<br /><span>そのまま少しお待ちください。</span></p></div>}
          {busy && <button type="button" className="button outline wide" onClick={cancelAnalysis}>判定をキャンセル</button>}
          {cancelled && <p className="fine" role="status">判定の待機をキャンセルしました。品目から調べるか、再度写真を送れます。送信済みの判定は利用回数に含まれる場合があります。</p>}
          {error && <div className="error" role="alert">{error}</div>}
          {classification && <div className="observation"><span className="small-label">AIが写真から読み取ったこと</span><p>{classification.observation}</p><span className="fine">候補の判断です。正しさを保証する表示ではありません。</span></div>}
          {classification?.itemId === 'hazard' && <div className="notice"><strong>このアプリでは捨て方を決めません</strong><p>電池・刃物・スプレー缶などは写真だけで判断せず、<a href={SOURCES.danger} target="_blank" rel="noreferrer">市の案内</a>と<a href={SOURCES.dictionary} target="_blank" rel="noreferrer">品目検索</a>を確認してください。</p></div>}
          {classification?.itemId === 'unknown' && <div className="notice"><strong>候補を絞れませんでした</strong><p>明るい場所で1つだけ撮り直すか、下から品目を選んでください。対象外は<a href={SOURCES.dictionary} target="_blank" rel="noreferrer">公式検索</a>へ。</p></div>}
          {selected ? <RuleGuide key={`${selected}-${revision}`} id={selected} origin={origin}/> : !busy && !classification && !error && <div className="empty"><div className="empty-icon"><Recycle size={44}/></div><h3>これは、何ごみ？</h3><p>写真を送るか、下の品目を選ぶと<br />確認するポイントが表示されます。</p><span className="mini-flow">候補を探す <ArrowRight size={13}/> 実物を確認 <ArrowRight size={13}/> 出し方を見る</span></div>}
        </section>
      </div>
      <section className="manual" aria-labelledby="manual-heading"><div className="manual-heading"><div><p className="eyebrow">名前が分かるときは</p><h2 id="manual-heading">品目から調べる</h2></div><span>写真の送信・AIの利用なし</span></div>
        <div className="item-grid">{ITEM_IDS.map(id => <button className={selected === id ? 'item-button selected' : 'item-button'} key={id} onClick={() => choose(id, 'manual')}><ItemIcon id={id}/><span>{RULES[id].short}</span><ArrowRight size={14}/></button>)}</div>
        {busy && <p className="fine">品目を選ぶと、写真判定の待機をキャンセルして切り替えます。</p>}
        <p className="fine">AIの候補が違う場合も、ここから選び直せます。条件が合わない品物は公式検索へ。</p>
      </section>
      <section className="about"><CircleHelp size={22}/><div><h2>迷ったら、公式の案内へ。</h2><p>電池、刃物、割れたガラス、スプレー缶などは、このアプリの分別案内の対象外です。事業所のごみや、那覇市以外のルールには対応していません。</p><a href={SOURCES.dictionary} target="_blank" rel="noreferrer">那覇市のごみ・資源分別検索 <ArrowRight size={14}/></a></div></section>
    </main><footer><span>那覇ごみナビ</span><span>公式資料の確認日 2026.10.09 ／ 学生チームの試作</span></footer>
  </div>;
}
