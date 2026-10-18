"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { wasteItems, type WasteItem } from "./wasteItems";
import { categories } from "./wastelist";

type ScheduledItem = WasteItem & {
  collected: boolean;
};

// 自治体の正式な申し込みURLに変更してください
const APPLICATION_URL = "";

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

export default function App() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState("");
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
      item.name.toLowerCase().includes(keyword),
    );
  }, [query]);

  // ジャンルごとに候補を絞り込む
  const filteredItems = useMemo(() => {
    return wasteItems.filter(
      (item) => category === "すべて" || item.category === category,
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
        item.id === id ? { ...item, collected: !item.collected } : item,
      ),
    );
  };

  // 収集日の前日を計算
  const reminderDate = useMemo(() => {
    if (!pickupDate) return "";

    const date = new Date(`${pickupDate}T12:00:00`);
    date.setDate(date.getDate() - 1);

    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }, [pickupDate]);

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
        </section>

        {/* 検索エリア */}
        <div className="mx-auto max-w-md">
          <label htmlFor="region" className="mb-2 block font-bold">
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
            <p className="mt-4">選択した市町村：{selectedRegion}</p>
          )}
        </div>
        <section className="bg-white rounded-2xl p-5 md:p-7 shadow-sm">
          <h2 className="text-xl font-bold mb-2">何を捨てますか？</h2>
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
              <h3 className="text-xl font-bold mt-1">{selectedItem.name}</h3>
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
              <p className="font-bold text-amber-900">🔔 前日の確認予定</p>
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
              {items.filter((item) => item.collected).length}/{items.length}{" "}
              完了
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
                      item.collected ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {item.name}
                    <span className="block text-sm text-slate-500 font-normal mt-1">
                      {item.category}
                    </span>
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      item.collected ? "text-emerald-700" : "text-slate-400"
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
              自治体の申し込みURLを設定すると、 ここにリンクが表示されます。
            </p>
          )}
        </section>

        <footer className="text-center text-xs text-slate-400 py-4">
          すっきり回収ナビ｜地域のルールを確認して正しく出しましょう。
        </footer>
      </main>
    </div>
  );
}
