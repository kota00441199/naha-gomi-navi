
'use client';
<<<<<<< HEAD
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
=======
import { useMemo, useState } from "react";
import {
  wasteItems,
  type WasteItem,
} from "./wasteItems";
import { categories } from "./WasteList";
import { useRouter } from "next/navigation";

type ScheduledItem = WasteItem & {
  collected: boolean;
};

const router = useRouter();




// 自治体の正式な申し込みURLに変更してください
const APPLICATION_URL = "";

export default function App() {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [category, setCategory] = useState("すべて");
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupPlace, setPickupPlace] = useState("");
  const [ticketInfo, setTicketInfo] = useState("");
  const [items, setItems] = useState<ScheduledItem[]>([]);

  // 入力された文字に一致する候補を検索
  const suggestions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return [];

    return wasteItems.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
  }, [query]);

  // ジャンルごとに候補を絞り込む
  const filteredItems = useMemo(() => {
    return wasteItems.filter(
      (item) =>
        category === "すべて" || item.category === category
    );
  }, [category]);

  // 用具を管理リストに追加
  const addItem = (item: WasteItem) => {
    setItems((prev) => [
      ...prev,
      { ...item, id: Date.now(), collected: false },
    ]);
    setSelectedItem(null);
    setQuery("");
    setShowList(false);
  };

  // 搬出済みかどうかを切り替える
  const toggleCollected = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, collected: !item.collected }
          : item
      )
    );
  };

  // 収集日の前日を計算
  const reminderDate = useMemo(() => {
    if (!pickupDate) return "";

    const date = new Date(`${pickupDate}T12:00:00`);
    date.setDate(date.getDate() - 1);

    return `${date.getFullYear()}年${
      date.getMonth() + 1
    }月${date.getDate()}日`;
  }, [pickupDate]);

  const [selectedRegion, setSelectedRegion] = useState("");

  // 沖縄県の市町村一覧
  const regions = [
    "那覇市",
    "宜野湾市",
    "石垣市",
    "浦添市",
    "名護市",
    "糸満市",
    "沖縄市",
    "豊見城市",
    "うるま市",
    "宮古島市",
    "南城市",
    "国頭村",
    "大宜味村",
    "東村",
    "今帰仁村",
    "本部町",
    "恩納村",
    "宜野座村",
    "金武町",
    "伊江村",
    "読谷村",
    "嘉手納町",
    "北谷町",
    "北中城村",
    "中城村",
    "西原町",
    "与那原町",
    "南風原町",
    "久米島町",
    "渡嘉敷村",
    "座間味村",
    "粟国村",
    "渡名喜村",
    "南大東村",
    "北大東村",
    "伊平屋村",
    "伊是名村",
    "八重瀬町",
    "多良間村",
    "竹富町",
    "与那国町",
  ];

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-800">
      {/* ヘッダー */}
      <header className="bg-white border-b border-emerald-100">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="text-3xl">♻️</span>
            <div>
              <h1 className="text-xl font-bold text-emerald-800">
                すっきり回収ナビ
              </h1>
              <p className="text-xs text-slate-500">
                粗大ゴミの分別・申し込み管理
              </p>
            </div>
          </a>
            
          <a
            href="#schedule"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            収集予定を見る ↓
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8 space-y-8">
        {/* メインビジュアル */}
        <section className="rounded-3xl bg-emerald-800 text-white p-7 md:p-10">
          <p className="text-emerald-200 text-sm font-semibold mb-3">
            SMART WASTE GUIDE
          </p>
          <h2 className="text-3xl md:text-4xl font-bold leading-relaxed">
            粗大ゴミ、
            <br />
            迷わず片付けよう。
          </h2>
          <p className="mt-4 text-emerald-100 leading-relaxed">
            捨て方を調べて、申し込んで、
            <br className="sm:hidden" />
            出し忘れも防止しよう。
          </p>
>>>>>>> 71f9ae0 (コミットします)
        </section>

        {/* 検索エリア */}
        <div className="mx-auto max-w-md">
        <label
          htmlFor="region"
          className="mb-2 block font-bold"
        >
          市町村を選択してください
        </label>

        <select
          id="region"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full rounded-xl border border-gray-300 p-3"
        >
          <option value="">市町村を選択</option>

          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {selectedRegion && (
          <p className="mt-4">
            選択した市町村：{selectedRegion}
          </p>
        )}
      </div>
<<<<<<< HEAD
      <section className="manual" aria-labelledby="manual-heading"><div className="manual-heading"><div><p className="eyebrow">名前が分かるときは</p><h2 id="manual-heading">品目から調べる</h2></div><span>写真の送信・AIの利用なし</span></div>
        <div className="item-grid">{ITEM_IDS.map(id => <button className={selected === id ? 'item-button selected' : 'item-button'} key={id} onClick={() => choose(id, 'manual')}><ItemIcon id={id}/><span>{RULES[id].short}</span><ArrowRight size={14}/></button>)}</div>
        {busy && <p className="fine">品目を選ぶと、写真判定の待機をキャンセルして切り替えます。</p>}
        <p className="fine">AIの候補が違う場合も、ここから選び直せます。条件が合わない品物は公式検索へ。</p>
      </section>
      <section className="about"><CircleHelp size={22}/><div><h2>迷ったら、公式の案内へ。</h2><p>電池、刃物、割れたガラス、スプレー缶などは、このアプリの分別案内の対象外です。事業所のごみや、那覇市以外のルールには対応していません。</p><a href={SOURCES.dictionary} target="_blank" rel="noreferrer">那覇市のごみ・資源分別検索 <ArrowRight size={14}/></a></div></section>
    </main><footer><span>那覇ごみナビ</span><span>公式資料の確認日 2026.10.09 ／ 学生チームの試作</span></footer>
  </div>;
}
=======
        <section className="bg-white rounded-2xl p-5 md:p-7 shadow-sm">
          <h2 className="text-xl font-bold mb-2">
            何を捨てますか？
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            用具名を入力して、該当する粗大ゴミを探しましょう。
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-3.5">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例：椅子、テーブル、自転車"
                className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {query.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setQuery(item.name);
                        }}
                        className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-emerald-50 border-b last:border-b-0"
                      >
                        <span>{item.name}</span>
                        <span className="text-sm text-slate-500">
                          {item.category} →
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-slate-500">
                      候補がありません。リストから探してください。
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
          onClick={() => router.push("/waste-list")}
          className="rounded-xl bg-sky-500 px-6 py-3 font-bold text-white hover:bg-sky-600"
        >
          リストから探す
        </button>
          </div>

          {/* ジャンル選択 */}
          {showList && (
            <div className="mt-6 border-t pt-5">
              <h3 className="font-bold mb-3">ジャンルを選択</h3>

              <div className="flex flex-wrap gap-2 mb-5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      category === c
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-emerald-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`text-left border rounded-xl p-4 hover:border-emerald-500 hover:bg-emerald-50 transition ${
                      selectedItem?.id === item.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-slate-200"
                    }`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="block text-sm text-slate-500 mt-1">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 選択した用具 */}
          {selectedItem && (
            <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-5">
              <p className="text-sm text-emerald-700 font-semibold">
                選択した用具
              </p>
              <h3 className="text-xl font-bold mt-1">
                {selectedItem.name}
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                ジャンル：{selectedItem.category}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                処理手数料の参考値：{selectedItem.fee}円
              </p>
              <button
                onClick={() => addItem(selectedItem)}
                className="mt-4 w-full sm:w-auto rounded-xl bg-emerald-700 text-white px-5 py-3 font-semibold hover:bg-emerald-800"
              >
                ＋ 搬出リストに追加
              </button>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">
            ※ 用具名・手数料はサンプルデータです。
            実際の分別区分や料金は自治体の情報に置き換えてください。
          </p>
        </section>

        {/* 収集予定の登録 */}
        <section
          id="schedule"
          className="bg-white rounded-2xl p-5 md:p-7 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">📅</span>
            <div>
              <h2 className="text-xl font-bold">収集予定の登録</h2>
              <p className="text-sm text-slate-500">
                収集日と搬出に必要な情報を記録しましょう。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm font-semibold">
              収集日
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="block w-full mt-2 border border-slate-300 rounded-xl px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-semibold">
              粗大ゴミを出す場所
              <input
                value={pickupPlace}
                onChange={(e) => setPickupPlace(e.target.value)}
                placeholder="例：自宅前の指定場所"
                className="block w-full mt-2 border border-slate-300 rounded-xl px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-semibold sm:col-span-2">
              処理券について
              <input
                value={ticketInfo}
                onChange={(e) => setTicketInfo(e.target.value)}
                placeholder="例：処理券300円分を用意する"
                className="block w-full mt-2 border border-slate-300 rounded-xl px-3 py-3 font-normal"
              />
            </label>
          </div>

          {pickupDate && (
            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-5">
              <p className="font-bold text-amber-900">
                🔔 前日の確認予定
              </p>
              <p className="text-sm text-amber-800 mt-2">
                {reminderDate} に、以下の内容を確認しましょう。
              </p>
              <ul className="text-sm text-amber-900 mt-3 space-y-2">
                <li>• 処理券：{ticketInfo || "未登録"}</li>
                <li>• 搬出場所：{pickupPlace || "未登録"}</li>
                <li>
                  • 出すもの：
                  {items.length > 0
                    ? items.map((item) => item.name).join("、")
                    : "搬出リストは空です"}
                </li>
              </ul>
            </div>
          )}
        </section>

        {/* 搬出チェックリスト */}
        <section className="bg-white rounded-2xl p-5 md:p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold">搬出チェックリスト</h2>
              <p className="text-sm text-slate-500 mt-1">
                ゴミを出したらチェックを入れましょう。
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-bold">
              {items.filter((item) => item.collected).length}/{items.length} 完了
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-slate-50">
              <p className="text-3xl mb-3">🧹</p>
              <p className="font-semibold">まだ用具が登録されていません</p>
              <p className="text-sm text-slate-500 mt-2">
                上の検索欄から粗大ゴミを追加してください。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-emerald-50"
                >
                  <input
                    type="checkbox"
                    checked={item.collected}
                    onChange={() => toggleCollected(item.id)}
                    className="w-5 h-5 accent-emerald-700"
                  />
                  <span
                    className={`flex-1 font-semibold ${
                      item.collected
                        ? "line-through text-slate-400"
                        : ""
                    }`}
                  >
                    {item.name}
                    <span className="block text-sm text-slate-500 font-normal mt-1">
                      {item.category}
                    </span>
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      item.collected
                        ? "text-emerald-700"
                        : "text-slate-400"
                    }`}
                  >
                    {item.collected ? "搬出済み ✓" : "未搬出"}
                  </span>
                </label>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <button
              onClick={() =>
                setItems((prev) => prev.filter((item) => !item.collected))
              }
              className="mt-4 text-sm text-slate-500 underline hover:text-red-600"
            >
              搬出済みの用具をリストから削除
            </button>
          )}
        </section>

        {/* 自治体の申し込みサイト */}
        <section className="rounded-2xl bg-white border border-emerald-100 p-5 md:p-7">
          <h2 className="text-xl font-bold">申し込みはこちら</h2>
          <p className="text-sm text-slate-500 mt-2 mb-4">
            お住まいの自治体の公式サイトで、収集の申し込みを行いましょう。
          </p>

          {APPLICATION_URL ? (
            <a
              href={APPLICATION_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-5 py-3 font-semibold hover:bg-emerald-800"
            >
              申し込みサイトへ ↗
            </a>
          ) : (
            <p className="text-sm text-amber-800 bg-amber-50 rounded-xl p-4">
              自治体の申し込みURLを設定すると、
              ここにリンクが表示されます。
            </p>
          )}
        </section>

        <footer className="text-center text-xs text-slate-400 py-4">
          すっきり回収ナビ｜地域のルールを確認して正しく出しましょう。
        </footer>
      </main>
    </div>
  );
};
>>>>>>> 71f9ae0 (コミットします)
