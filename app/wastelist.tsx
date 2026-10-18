import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { wasteItems } from "./wasteItems";

export const categories = [
  "すべて",
  "家事日用品",
  "家具・寝具",
  "家電製品",
  "趣味・園芸・工具用品",
  "その他のもの",
  "収納庫・室外用品",
  "自転車類",
  "スポーツ・レジャー・遊具",
  "健康器具",
  "楽器・オーディオ製品",
  "敷物・室内用品",
  "ＯＡ機器",
  "乳幼児製品",
];

export const WasteList = () => {
  const navigate = useNavigate();

  // 選択中のカテゴリ
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  // 選択したカテゴリに該当する粗大ごみを抽出
  const filteredItems = wasteItems.filter((item) => {
    return selectedCategory === "すべて" || item.category === selectedCategory;
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <header className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="rounded-lg border bg-white px-3 py-2 hover:bg-gray-100"
        >
          ← 戻る
        </button>

        <h1 className="text-2xl font-bold">粗大ごみを探す</h1>
      </header>

      <section className="mx-auto max-w-2xl">
        <h2 className="mb-3 text-lg font-bold">カテゴリから探す</h2>

        {/* カテゴリ一覧 */}
        <div className="overflow-hidden rounded-xl border bg-white">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex w-full items-center justify-between border-b p-4 text-left last:border-b-0 hover:bg-gray-100 ${
                selectedCategory === category
                  ? "bg-sky-100 font-bold text-sky-700"
                  : "bg-white"
              }`}
            >
              <span>{category}</span>
              <span>›</span>
            </button>
          ))}
        </div>

        {/* 絞り込み結果 */}
        <h2 className="mb-3 mt-6 text-lg font-bold">
          検索結果：{selectedCategory}
        </h2>

        {filteredItems.length > 0 ? (
          <ul className="space-y-2">
            {filteredItems.map((item) => (
              <li key={item.id} className="rounded-xl border bg-white p-4">
                <p className="font-bold">{item.name}</p>
                <p className="mt-1 text-sm text-gray-600">
                  カテゴリ：{item.category}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  手数料：{item.fee}円
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-white p-4 text-gray-500">
            該当する粗大ごみがありません。
          </p>
        )}
      </section>
    </main>
  );
};
