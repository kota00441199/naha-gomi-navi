
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { wasteItems, categories } from "./nahagomidata";

const PENDING_ITEMS_KEY = "waste-list-pending-items";

type WasteItem = (typeof wasteItems)[number];

type PendingWasteItem = {
  item: WasteItem;
  quantity: number;
};

export const WasteList = () => {
  const navigate = useNavigate();

  // null：カテゴリ一覧、文字列：選択したカテゴリの品目一覧
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  // 展開中の品目
  const [expandedItemId, setExpandedItemId] =
    useState<WasteItem["id"] | null>(null);

  // この画面で搬出リストに追加した品目
  const [carryOutItems, setCarryOutItems] = useState<WasteItem[]>([]);

  // 追加する個数
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // 選択したカテゴリに該当する粗大ごみを抽出
  const filteredItems = wasteItems.filter((item) => {
    return (
      selectedCategory === "すべて" ||
      item.category === selectedCategory
    );
  });

  // 品目を搬出チェックリストに追加
  const addToCarryOutList = (
    item: WasteItem
  ) => {
    // ほかの画面で追加した品目があれば残したまま、新しい登録を追加
    const storedItems = localStorage.getItem(PENDING_ITEMS_KEY);

    let pendingItems: PendingWasteItem[] = [];

    if (storedItems) {
      try {
        pendingItems = JSON.parse(storedItems) as PendingWasteItem[];
      } catch {
        pendingItems = [];
      }
    }

    pendingItems.push({
      item,
      quantity: selectedQuantity,
    });

    localStorage.setItem(
      PENDING_ITEMS_KEY,
      JSON.stringify(pendingItems)
    );

    // この画面での追加済み表示と点数表示
    setCarryOutItems((currentItems) => [
      ...currentItems,
      ...Array.from({ length: selectedQuantity }, () => item),
    ]);
  };

  // 戻るボタンの動作
  const handleBack = () => {
    if (selectedCategory !== null) {
      setSelectedCategory(null);
      setExpandedItemId(null);
    } else {
      navigate("/");
    }
  };

  return (
    <main className="min-h-screen bg-emerald-50 p-4">
      <header className="mb-4 grid grid-cols-3 items-center">
        <button
          onClick={handleBack}
          className="justify-self-start rounded-lg border-3 border-black text-white bg-emerald-500 px-3 py-2 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_black]"
        >
          戻る
        </button>

        <h1 className="col-span-1 text-center text-lg font-bold sm:text-2xl">
          粗大ごみを探す
        </h1>
      </header>

      <section className="mx-auto max-w-2xl overflow-hidden">
        {/* 2画面を横に並べ、選択に応じてスライド */}
        <div
          className={`flex w-[200%] items-start transition-transform duration-300 ease-in-out ${
            selectedCategory !== null
              ? "-translate-x-1/2"
              : "translate-x-0"
          }`}
        >
          {/* 左側：カテゴリ一覧 */}
          <div className="w-1/2 shrink-0 px-1">
            <p className="justify-self-end text-xs font-bold sm:text-sm">
              搬出リスト：{carryOutItems.length}点
            </p>

            <h2 className="mb-3 text-lg font-bold">
              カテゴリから探す
            </h2>

            <div className="overflow-hidden rounded-xl border bg-white">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setExpandedItemId(null);
                    setSelectedQuantity(1);
                    setSelectedCategory(category);
                  }}
                  className="flex w-full items-center justify-between border-b bg-white p-4 text-left last:border-b-0 hover:bg-gray-100"
                >
                  <span>{category}</span>
                  <span>›</span>
                </button>
              ))}
            </div>
          </div>

          {/* 右側：選択したカテゴリの品目一覧 */}
          <div className="w-1/2 shrink-0 px-1">
            <h2 className="mb-3 text-lg font-bold">
              {selectedCategory}の品目
            </h2>

            <div className="overflow-hidden rounded-xl border bg-white">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isExpanded = expandedItemId === item.id;

                  const isAdded = carryOutItems.some(
                    (addedItem) => addedItem.id === item.id
                  );

                  return (
                    <div
                      key={item.id}
                      className="border-b last:border-b-0"
                    >
                      {/* 品目を選択 */}
                      <button
                        onClick={() => {
                          setExpandedItemId(
                            isExpanded ? null : item.id
                          );
                          if (!isExpanded) {
                            setSelectedQuantity(1);
                          }
                        }}
                        aria-expanded={isExpanded}
                        className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-100 ${
                          isExpanded
                            ? "bg-sky-100 font-bold text-sky-700"
                            : "bg-white"
                        }`}
                      >
                        <span>{item.name}</span>
                        <span
                          className={`transition-transform duration-300 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        >
                          ›
                        </span>
                      </button>

                      {/* 品目の下にスライド表示する追加画面 */}
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                          isExpanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="space-y-3 bg-emerald-50 px-4 py-3">
                            <p className="text-sm text-gray-700">
                              カテゴリ：{item.category}
                            </p>

                            {/* 個数変更ボタン */}
                            <div>
                              <p className="mb-2 text-sm font-semibold text-gray-700">
                                個数
                              </p>

                              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-emerald-300 bg-white">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedQuantity((quantity) =>
                                      Math.max(1, quantity - 1)
                                    )
                                  }
                                  disabled={selectedQuantity <= 1}
                                  aria-label="個数を減らす"
                                  className="px-4 py-3 font-bold hover:bg-emerald-100 disabled:cursor-not-allowed disabled:text-slate-300"
                                >
                                  −
                                </button>

                                <span
                                  className="min-w-10 text-center font-bold"
                                  aria-live="polite"
                                >
                                  {selectedQuantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedQuantity(
                                      (quantity) => quantity + 1
                                    )
                                  }
                                  aria-label="個数を増やす"
                                  className="px-4 py-3 font-bold hover:bg-emerald-100"
                                >
                                  ＋
                                </button>
                              </div>
                            </div>

                            {/* 個数に応じた料金 */}
                            <p className="text-sm font-semibold text-gray-700">
                              手数料：{item.fee * selectedQuantity}円
                            </p>

                            <button
                              onClick={() => addToCarryOutList(item)}
                              disabled={isAdded}
                              className={`w-full rounded-lg px-4 py-3 font-bold text-white transition-colors ${
                                isAdded
                                  ? "cursor-default bg-gray-400"
                                  : "bg-emerald-700 hover:bg-emerald-800"
                              }`}
                            >
                              {isAdded
                                ? "搬出リストに追加済み"
                                : "搬出リストに追加"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="p-4 text-gray-500">
                  該当する粗大ごみがありません。
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
