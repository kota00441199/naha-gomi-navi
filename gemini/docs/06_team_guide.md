# 6. チーム向け説明資料：ゴミ分別AI（Gemini）の使い方

対象：フロントエンド・バックエンド担当のメンバー
作成：プロンプト・AI評価担当

## 3行でまとめると

1. 画像1枚と那覇市のルール本文をGeminiに渡すと、**決まった形のJSON**が返ってきます（[02_json_spec.md](02_json_spec.md)）。
2. Geminiは**自分の知識で分別区分を決めません**。渡されたルールにない物には「自治体の公式情報を確認してください」と答えます。
3. 認識結果には**確実性**と**確認したいこと**が付いてくるので、画面に出してください。

## ⚠️ 現在の状態

- プロンプトとJSONの形式は完成しています（v1.0）
- **Geminiでの実機テストはまだしていません**（APIキーとテスト画像がないため）。精度はまだ分かりません
- 那覇市のルールは公式ホームページから転記しました。**別の人による確認はまだです**

## バックエンド担当へ：Geminiの呼び出し方

使うファイルはすべて `prompts/` にあります。**中身をコードにコピーせず、ファイルから読み込んでください**（プロンプトを更新したときに反映されるようにするため）。

| 渡すもの | ファイル | SDKの設定 |
|---|---|---|
| 指示文 | `prompts/system_instruction.txt` | `config.systemInstruction` |
| 出力形式 | `prompts/response_schema.json` | `config.responseJsonSchema`、`config.responseMimeType = "application/json"` |
| 画像 | ユーザーの写真 | `contents` の1つ目のパート（`inlineData`） |
| ルール・補足 | `prompts/user_prompt_template.txt` の差し込み項目を置き換えたもの | `contents` の2つ目のパート（`text`） |
| 那覇市ルール | `eval/rules/naha-city-rules.md` の本文 | `{{MUNICIPALITY_RULES}}` に入れる |

呼び出し方の具体例は、検証スクリプト [eval/src/run-eval.ts](../eval/src/run-eval.ts) の `callGemini` と `renderUserPrompt` を参照してください（あくまで検証用のコードです。アプリ本体の実装はお任せします）。

**守ってほしいこと**

- ルールがないときは、`{{MUNICIPALITY_RULES}}` に必ず `提供なし` と入れる（空文字にしない）
- 返ってきたJSONは `response_schema.json` で検証する。失敗したら1回だけ再試行する
- `rule_status` が `applied` の `category` は、那覇市ルールの区分一覧にあるか確認する（全角・半角を正規化してから比べる）

## フロントエンド担当へ：表示のお願い

| JSONの状態 | 表示のお願い |
|---|---|
| `image_assessment.contains_waste = false` | 「ゴミが見つかりませんでした」＋撮り直しの案内 |
| `image_assessment.overall_quality = "poor"` | 結果と一緒に `retake_advice` を目立つように表示する |
| `confidence = "low"` / `"medium"` | 「推定」「確認してください」などのラベルを付ける。`high` と同じ見た目にしない |
| `sorting[].rule_status = "applied"` | `category`（区分）と `disposal_method`（出し方）を表示する |
| `sorting[].rule_status = "needs_confirmation"` | `candidates` を「〇〇の場合は△△」の形で並べ、`questions_for_user` を表示する |
| `not_found` / `no_rules` | `disposal_method`（「自治体の公式情報を確認してください」）＋那覇市公式サイトへのリンク |
| `cautions[].type = "general_safety"` | 電池の発火など安全に関わる内容なので、⚠️アイコンなどで目立たせる |
| `items` が複数 | `location`（「画像左側」など）を見出しにして、1つずつ表示する |
| ペットボトルなど `sorting` が複数 | 「本体」「キャップ」など `target` ごとに出し方を表示する |

那覇市の公式ページ：<https://www.city.naha.okinawa.jp/kurasitetuduki/gomi-recycling/1001934/1001935.html>

## 那覇市ルールで気をつける点

一般的な知識と違うところがあります。AIの回答が「おかしい」と感じても、まず那覇市のルールを確認してください。

- プラスチック容器・トレイ・ペットボトルのキャップ → **もやすごみ**
- PETマークのないプラスチックボトル → **もやすごみ**
- 化粧品のびん → **もやさないごみ**
- スプレー缶・カセットボンベ → 中身を使い切って **資源化物（缶）**
- リチウムイオン電池・モバイルバッテリー → **危険ごみ**（令和8年3月から）

## 検証を手伝ってくれる人へ

テスト用の写真を撮ってもらえると助かります。

1. [03_test_cases.md](03_test_cases.md) の「画像」の欄にある撮り方を見て撮影する
2. `eval/images/TC01.jpg` のように、**ケースIDをファイル名にして**置く
3. 顔・住所・名前など個人情報が写らないようにする（写真はGemini APIに送信されます）

実行方法（プロンプト担当が行います）：

```bash
cd eval
npm install
npm run check      # APIを使わない準備確認
export GEMINI_API_KEY=...
npm run eval       # 実行 → results/ にレポートができる
```

## 変更を依頼したいとき

- プロンプトやJSONの形式を変えたいときは、プロンプト担当に連絡してください（直接編集しないでください）
- JSONの形式を変えるときは `schema_version` を上げ、[02_json_spec.md](02_json_spec.md) と [05_prompt_changelog.md](05_prompt_changelog.md) を更新します
