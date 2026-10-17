# 6. チーム向け説明資料：そ大ごみAI（Gemini）の使い方

対象：フロントエンド・バックエンド担当のメンバー
作成：プロンプト・AI評価担当

## 3行でまとめると

1. 写真1枚と那覇市の品目リストをGeminiに渡すと、**写っている物がどの品目IDに当たるか**がJSONで返ってきます（[02_json_spec.md](02_json_spec.md)）。
2. **料金・処理券・販売店はGeminiは答えません。** 品目IDを使って、アプリが [data/](../data/README.md) の公式データから表示してください。
3. 小か大か、スプリング入りかが写真で分からないときは、**候補と確認の質問**が返ってきます。画面に出して、利用者に選んでもらってください。

## ⚠️ 現在の状態

- 2026-10-17 に方針を変更しました（分別全般 → **そ大ごみだけ**）。プロンプトとJSON形式は v2.0 です
- **v2.0 はGeminiでの実機テストをまだしていません**（テスト画像待ち）
- 処理券の販売店データは公式PDFを目で見て転記しました。**別の人による確認はまだです**

## バックエンド担当へ：Geminiの呼び出し方

使うファイルはすべて `prompts/` にあります。**中身をコードにコピーせず、ファイルから読み込んでください。**

| 渡すもの | ファイル | SDKの設定 |
|---|---|---|
| 指示文 | `prompts/system_instruction.txt` | `config.systemInstruction` |
| 出力形式 | `prompts/response_schema.json` | `config.responseJsonSchema`、`config.responseMimeType = "application/json"` |
| 画像 | ユーザーの写真 | `contents` の1つ目のパート（`inlineData`） |
| 品目リスト・補足 | `prompts/user_prompt_template.txt` の差し込み項目を置き換えたもの | `contents` の2つ目のパート（`text`） |
| 那覇市の品目リスト | `prompts/rules_naha_sodai.txt` | `{{SODAI_RULES}}` に入れる |

呼び出し方の具体例は、検証スクリプト [eval/src/run-eval.ts](../eval/src/run-eval.ts) の `callGemini` と `renderUserPrompt` を参照してください（検証用のコードです）。

**守ってほしいこと**

- 返ってきたJSONは `response_schema.json` で検証する。失敗したら1回だけ再試行する
- 品目IDは `data/naha-sodai-items.json` で引けるか確認する。引けないIDの料金は表示しない
- 料金は Gemini の文章からではなく、必ず `data/` から表示する
- 利用者が確認の質問に答えたら、その内容を `{{USER_NOTE}}` に入れて呼び直す

## フロントエンド担当へ：表示のお願い

| JSONの状態 | 表示のお願い |
|---|---|
| `contains_waste = false` | 「捨てる物が見つかりませんでした」＋撮り直しの案内 |
| `overall_quality = "poor"` または `issues` に `no_scale_reference` | `retake_advice` を目立つように表示する |
| `sodai.status = "listed"` | 品目名、料金、処理券の種類と枚数、その券を売っている店 |
| `sodai.status = "needs_confirmation"` | 候補を「〇〇の場合 → △△円」の形で並べ、`questions_for_user` を表示。利用者が選べるようにする |
| `sodai.status = "not_collected"` | 「市では収集していません」＋ `data/naha-sodai-info.json` の案内 |
| `sodai.status = "not_sodai"` / `"not_listed"` | 「そ大ごみではない可能性があります」／「クリーン推進課（098-889-3567）に確認してください」 |
| `confidence = "low"` / `"medium"` | 「推定」などのラベルを付け、`high` と同じ見た目にしない |
| `items` が複数 | `location`（「画像左側」など）を見出しにして、1つずつ表示する |

`listed` と `needs_confirmation` では、申込方法（Web・電話）と出し方（受付番号を処理券に書く、収集日の朝8時30分までに出す）もあわせて表示してください。データの場所と使い方は [data/README.md](../data/README.md) にあります。

## 那覇市のそ大ごみで気をつける点

- 料金は **処理券1枚300円**。「小」（1㎥未満かつ10kg以下）は1枚、「大」は2枚
- スプリング入りのマットレス・ソファーは**別の券**（1,270円／1,940円／2,600円）。**扱っていない店がある**
- 電子レンジ・除湿機・石油ストーブなどは、指定ごみ袋に入っても**そ大ごみ**
- テレビ・エアコン・冷蔵庫・洗濯機・パソコンは**市では収集しない**
- 1回に申し込めるのは**6点まで**

## 検証を手伝ってくれる人へ

テスト用の写真を撮ってもらえると助かります。会場で撮りやすい物（椅子、机、ホワイトボード、ノートパソコン、段ボール箱など）から集めています。

1. [03_test_cases.md](03_test_cases.md) の「画像」の欄にある撮り方を見て撮影する
2. `eval/images/TC01.jpg` のように、**ケースIDをファイル名にして**置く（拡張子は元のまま）
3. 顔・名前・画面の中身など個人情報が写らないようにする（写真はGemini APIに送信されます）

## 変更を依頼したいとき

- プロンプト・JSON形式・`data/` を変えたいときは、プロンプト担当に連絡してください（直接編集しないでください）
- JSONの形式を変えるときは `schema_version` を上げ、[02_json_spec.md](02_json_spec.md) と [05_prompt_changelog.md](05_prompt_changelog.md) を更新します
