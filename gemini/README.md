# ゴミ分別AI：Geminiプロンプトと検証一式

ゴミ分別Webアプリのうち、**Geminiへの指示文（プロンプト）**と**画像認識の検証**を担当する部分です。
アプリ本体（フロントエンド・バックエンド・API連携）は含みません。

対象の自治体：**那覇市**

## 状態（2026-10-16）

| 項目 | 状態 |
|---|---|
| プロンプト v1.0 | ✅ 完成（設計・机上レビュー済み） |
| JSON出力仕様 1.0 | ✅ 完成 |
| テストケース（20件） | ✅ 作成済み |
| 検証ツール | ✅ 作成済み・自己テスト合格 |
| 那覇市ルールの転記 | ✅ 公式HPから転記済み／⏳ 別メンバーによる確認待ち |
| Gemini API の接続 | ✅ 確認済み（`npm run ping`、gemini-3.8-flash） |
| **Gemini実機テスト** | ⏳ **未実施**（テスト画像待ち） |

## 成果物

| # | 成果物 | 場所 |
|---|---|---|
| 1 | Gemini用の完成版プロンプト | [prompts/](prompts/)（説明：[docs/01_prompt.md](docs/01_prompt.md)） |
| 2 | JSON出力形式の仕様書 | [docs/02_json_spec.md](docs/02_json_spec.md)、[prompts/response_schema.json](prompts/response_schema.json) |
| 3 | 画像認識テストケース一覧 | [docs/03_test_cases.md](docs/03_test_cases.md)（元データ：[eval/test-cases.json](eval/test-cases.json)） |
| 4 | テスト結果の記録 | [docs/04_test_results.md](docs/04_test_results.md) |
| 5 | プロンプトの改善履歴 | [docs/05_prompt_changelog.md](docs/05_prompt_changelog.md) |
| 6 | 他メンバーへの説明資料 | [docs/06_team_guide.md](docs/06_team_guide.md) ← **まずこれを読んでください** |

## フォルダ構成

```
gemini/
├── README.md                    このファイル
├── prompts/                     Geminiに渡すもの（アプリはここを読み込む）
│   ├── system_instruction.txt   指示文 v1.0
│   ├── user_prompt_template.txt 毎回の入力の型
│   ├── response_schema.json     出力形式（JSON Schema）
│   └── baseline_v0.txt          比較用の改善前プロンプト
├── docs/                        ドキュメント 01〜06
├── eval/                        検証ツール（TypeScript）
│   ├── test-cases.json          テストケースと期待値
│   ├── rules/                   那覇市ルール・架空のテスト用ルール
│   ├── images/                  テスト画像を置く場所（TC01.jpg など）
│   ├── samples/                 手書きの回答例（Geminiの出力ではない）
│   ├── results/                 実行結果が保存される場所
│   └── src/                     採点・実行スクリプト
└── _削除予定/                    削除するファイルの一時置き場
```

## 検証ツールの使い方

```bash
cd eval
npm install
npm run selftest   # 採点ロジックの自己テスト（APIは使わない）
npm run check      # 画像・ルール・APIキーの準備状況（APIは使わない）
npm run eval       # Geminiで実行（GEMINI_API_KEY が必要）
npm run docs       # test-cases.json から docs/03 を作り直す
```

主なオプション：`--case TC01,TC05`（対象を絞る）、`--repeat 3`（ばらつき確認）、`--prompt baseline`（改善前と比べる）。
環境変数：`GEMINI_MODEL`（既定 `gemini-3.8-flash`）、`GEMINI_TEMPERATURE`。
