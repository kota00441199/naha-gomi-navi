# 公式データ（アプリが表示する料金・案内・販売店）

対象：バックエンド・フロントエンド担当

Gemini は「どの品目IDに当たるか」だけを答えます。**料金・処理券・販売店・申込方法は、このフォルダのデータからアプリが表示してください。**
金額をAIに答えさせないことで、もっともらしい誤った料金が表示されるのを防ぎます。

## ファイル

| ファイル | 中身 | 出典 |
|---|---|---|
| [naha-sodai-items.json](naha-sodai-items.json) | 収集品目 321 件（品目ID・分類・品目名・小／大・料金・処理券の種類と枚数） | [そ大ごみ品目リスト・手数料検索](https://www.naha-sodaigomi.com/receipts/home/item)（2026-10-17取得） |
| [naha-sodai-info.json](naha-sodai-info.json) | 大きさの基準、処理券、申込方法（Web・電話）、出し方、市で収集しない物（X01〜X05） | [那覇市「そ大ごみ・スプリング入り製品」](https://www.city.naha.okinawa.jp/kurasitetuduki/gomi-recycling/1001934/1007525/1001941.html)（令和8年5月19日更新）ほか |
| [naha-ticket-stores.json](naha-ticket-stores.json) | 処理券の取扱店 56 店（地区・住所・電話・扱っている券） | [処理券店舗リスト PDF](https://www.naha-sodaigomi.com/receipts/assets/docment/20260721_ticket_sales_office_list.pdf)（2026-07-21版） |

## 確認状況

- `naha-sodai-items.json`：公式ページの表をプログラムで転記しました。品目IDは転記時に付けた通し番号で、那覇市の番号ではありません。
- `naha-ticket-stores.json`：**PDFを目で見て転記しました。別のメンバーによる照合はまだです。** 電話番号・住所はPDFの表記のままです（例：丸大 長田店の電話番号はPDFでは `198-` で始まっています）。
- 公式情報が変わったら、データを直してから `cd eval && npm run rules` を実行し、Gemini に渡す品目リストも作り直してください。

## Gemini の回答から画面表示を作る方法

Gemini の回答（[docs/02_json_spec.md](../docs/02_json_spec.md)）の `items[].sodai` を見ます。

| `sodai.status` | 画面に出すもの | 使うデータ |
|---|---|---|
| `listed` | 品目名・料金・処理券の種類と枚数・その券を売っている店 | `list_ids[0]` で `naha-sodai-items.json` を引く → `ticket.kind` で `naha-ticket-stores.json` の `sells` を絞り込む |
| `needs_confirmation` | 候補ごとに「条件 → 品目・料金」を並べ、`questions_for_user` を表示 | `candidates[].list_id` で `naha-sodai-items.json` を引く |
| `not_collected` | 「市では収集していません」＋案内 | `list_ids` で `naha-sodai-info.json` の `not_collected` を引き、`guidance` を表示 |
| `not_sodai` | 「そ大ごみではない可能性があります」＋市の「ごみの出し方」ページ | — |
| `not_listed` | 「品目リストにありません。クリーン推進課に確認してください」 | `naha-sodai-info.json` の `application.phone` |

`listed` と `needs_confirmation` では、あわせて次も表示してください：申込方法（`application`）、出し方（`how_to_put_out`）、処理券の注意（`tickets.notes`）。

### 例：Gemini が `S012`（椅子（スプリングなし）大）と答えた場合

```js
const item = items.find((i) => i.id === "S012");
// → { name: "椅子 （スプリングなし） 大", size: "大", fee_yen: 600,
//     ticket: { kind: "sodai", label: "そ大ごみ処理券", unit_price_yen: 300, count: 2 } }
const shops = stores.filter((s) => s.sells[item.ticket.kind]);
// → そ大ごみ処理券を扱う店（56店）
```

スプリング入り製品（`ticket.kind` が `spring_1270` / `spring_1940` / `spring_2600`）は、扱っていない店があります。必ず `sells` で絞り込んでください。
