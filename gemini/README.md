# そ大ごみAI：Geminiプロンプトと検証一式

那覇市の **そ大ごみ（粗大ごみ）案内アプリ** のうち、**Geminiへの指示文（プロンプト）**、**画像認識の検証**、**アプリが表示する公式データ**を担当する部分です。
アプリ本体（画面・API連携）は含みません。

写真に写った物が、那覇市の「そ大ごみ品目リスト」のどの品目に当たるかを Gemini が品目IDで答えます。
料金・必要な処理券・販売店・申込方法は、アプリが `data/` の公式データから表示します（Gemini には料金を答えさせません）。

対象の自治体：**那覇市**

## 状態（2026-10-17）

| 項目 | 状態 |
|---|---|
| 方針変更（v1.0 分別全般 → v2.0 そ大ごみのみ） | ✅ 2026-10-17 |
| 公式データ（品目321件・料金、案内、販売店56店） | ✅ 公式サイトから転記／⏳ 販売店は別メンバーによる確認待ち |
| プロンプト v2.0 | ✅ 完成（設計・机上レビュー済み） |
| JSON出力仕様 2.0 | ✅ 完成 |
| テストケース（18件） | ✅ 作成済み |
| 検証ツール | ✅ v2.0 に対応・自己テスト 5/5 合格 |
| Gemini API の接続 | ✅ 確認済み（v1.0 時点、gemini-3.8-flash） |
| **Gemini実機テスト（v2.0）** | ⏳ **未実施**（テスト画像待ち） |

## 成果物

| # | 成果物 | 場所 |
|---|---|---|
| 1 | Gemini用の完成版プロンプト | [prompts/](prompts/)（説明：[docs/01_prompt.md](docs/01_prompt.md)） |
| 2 | JSON出力形式の仕様書 | [docs/02_json_spec.md](docs/02_json_spec.md)、[prompts/response_schema.json](prompts/response_schema.json) |
| 3 | 画像認識テストケース一覧 | [docs/03_test_cases.md](docs/03_test_cases.md)（元データ：[eval/test-cases.json](eval/test-cases.json)） |
| 4 | テスト結果の記録 | [docs/04_test_results.md](docs/04_test_results.md) |
| 5 | プロンプトの改善履歴 | [docs/05_prompt_changelog.md](docs/05_prompt_changelog.md) |
| 6 | 他メンバーへの説明資料 | [docs/06_team_guide.md](docs/06_team_guide.md) ← **まずこれを読んでください** |
| 7 | アプリが表示する公式データ | [data/](data/)（説明：[data/README.md](data/README.md)） |

## フォルダ構成

```
gemini/
├── README.md                    このファイル
├── data/                        アプリが表示する公式データ（料金・案内・販売店）
├── prompts/                     Geminiに渡すもの（アプリはここを読み込む）
│   ├── system_instruction.txt   指示文 v2.0
│   ├── user_prompt_template.txt 毎回の入力の型
│   ├── rules_naha_sodai.txt     那覇市の品目リスト（data/ から自動生成）
│   ├── response_schema.json     出力形式（JSON Schema）
│   └── baseline_v0.txt          比較用の改善前プロンプト
├── docs/                        ドキュメント 01〜06
├── eval/                        検証ツール（TypeScript）
│   ├── test-cases.json          テストケースと期待値
│   ├── rules/                   架空のテスト用品目リスト
│   ├── images/                  テスト画像を置く場所（TC01.jpg など。Git には入れない）
│   ├── samples/                 手書きの回答例（Geminiの出力ではない）
│   ├── results/                 実行結果が保存される場所
│   └── src/                     採点・実行スクリプト
└── _削除予定/                    削除するファイルの一時置き場（Git には入れない）
```

## 検証ツールの使い方

```bash
cd eval
npm install
npm run selftest   # 採点ロジックの自己テスト（APIは使わない）
npm run check      # 画像・品目リスト・APIキーの準備状況（APIは使わない）
npm run ping       # Gemini API の接続確認（画像は使わない）
npm run eval       # Geminiで実行（GEMINI_API_KEY が必要）
npm run rules      # data/ から prompts/rules_naha_sodai.txt を作り直す
npm run docs       # test-cases.json から docs/03 を作り直す
```

主なオプション：`--case TC01,TC07`（対象を絞る）、`--repeat 3`（ばらつき確認）、`--prompt baseline`（改善前と比べる）。
環境変数：`GEMINI_MODEL`（既定 `gemini-3.8-flash`）、`GEMINI_TEMPERATURE`。
