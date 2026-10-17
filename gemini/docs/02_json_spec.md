# 2. JSON出力形式 仕様書（schema_version 1.0）

対象：バックエンド・フロントエンド担当
正式な定義：[prompts/response_schema.json](../prompts/response_schema.json)（このファイルと食い違う場合はスキーマが正）

## 全体の構造

```
{
  schema_version            "1.0"
  image_assessment          画像全体の評価
    overall_quality         good | fair | poor
    issues[]                dark | overexposed | blurry | too_far | partially_hidden | label_unreadable | cluttered
    contains_waste          true / false
    retake_advice           撮り直しのアドバイス or null
  items[]                   認識した物（0件のこともある）
    id                      item_1, item_2 …
    name                    物の名前（日本語。不明なら「不明な物体」）
    name_candidates[]       他の候補
    description             見た目の特徴
    location                画像内の位置
    quantity                個数 or null
    confidence              high | medium | low
    confidence_reason       確実性の理由
    components[]            部位ごとの材質
      part / material / material_basis (observed|inferred|unknown) / evidence
    is_composite            yes | no | unknown
    sorting[]               部位ごとの分別情報
      target / rule_status / category / disposal_method / rule_ids[] / candidates[]
    cautions[]              注意事項 { type, text }
    unknowns[]              画像では判断できない情報
    questions_for_user[]    ユーザーへの確認質問
  overall_notes             補足 or null
}
```

## 依頼された項目との対応

| 依頼された項目 | JSONの場所 |
|---|---|
| 認識した物体 | `items[].name`（＋ `name_candidates`, `description`, `location`, `quantity`） |
| 材質 | `items[].components[].material`（根拠は `material_basis`, `evidence`） |
| 認識の確実性 | `items[].confidence`（＋ `confidence_reason`）、画像全体は `image_assessment` |
| 分別カテゴリー | `items[].sorting[].category` |
| 処分方法 | `items[].sorting[].disposal_method` |
| 注意事項 | `items[].cautions[]` |
| 追加確認が必要な情報 | `items[].unknowns[]`, `items[].questions_for_user[]`, `sorting[].candidates[]` |
| （複数素材か） | `items[].is_composite` |

## 各項目の意味

### image_assessment

| 項目 | 型 | 意味・使い方 |
|---|---|---|
| `overall_quality` | enum | `good`：判断に十分 / `fair`：一部判断しにくい / `poor`：判断が難しい。`poor` のときは撮り直しを勧める表示を推奨 |
| `issues` | enum[] | 画像の問題点。表示用の日本語は下の対応表を参照 |
| `contains_waste` | boolean | `false` なら items は空。「ゴミが見つかりませんでした」と表示する |
| `retake_advice` | string \| null | そのまま画面に表示できる撮り直しの案内 |

### items[]

| 項目 | 型 | 意味・使い方 |
|---|---|---|
| `id` | string | `item_1` からの連番。画面でどの物かを指すときに使う |
| `name` | string | 物の名前。特定できなければ「不明な物体」 |
| `name_candidates` | string[] | 他の候補。「〇〇の可能性もあります」と表示できる |
| `description` | string | 見た目の特徴 |
| `location` | string | 画像内の位置（例：「画像左側」）。複数の物が写っているときの区別に使う |
| `quantity` | int \| null | 同じ物の個数。数えられなければ null |
| `confidence` | enum | 物の種類の認識の確実性。**材質の確実性ではない**ので、材質は `material_basis` を見る |
| `confidence_reason` | string | 確実性の理由 |
| `components[].part` | string | 部位（全体・本体・キャップ・ラベル等） |
| `components[].material` | string | 材質。分からなければ「不明」 |
| `components[].material_basis` | enum | `observed`：表示が読める・見た目で明白 / `inferred`：推測 / `unknown`：判断できない |
| `components[].evidence` | string | 判断の根拠 |
| `is_composite` | enum | 複数の素材でできているか |
| `cautions[]` | object[] | `type` が `official_rule`（公式ルール由来）、`general_safety`（一般的な安全注意）、`image_observation`（画像から気づいた点） |
| `unknowns` | string[] | 画像だけでは判断できないこと |
| `questions_for_user` | string[] | ユーザーに聞く質問（「〜ですか？」の形） |

### items[].sorting[]（分別情報）

部位ごとに出し方が違う場合は、複数件になります（例：ペットボトルの本体とキャップ）。

| 項目 | 型 | 意味・使い方 |
|---|---|---|
| `target` | string | 対象部位。`components[].part` と同じ名前になることが多い |
| `rule_status` | enum | 下の表を参照 |
| `category` | string \| null | 公式ルールの区分名（ルールの表記のまま）。`applied` 以外は **null** |
| `disposal_method` | string | 出し方。`applied` 以外は必ず **「自治体の公式情報を確認してください」** |
| `rule_ids` | string[] | 根拠にしたルールID（例：`N03`）。`applied` 以外は [] |
| `candidates[]` | object[] | `needs_confirmation` のときの候補 `{ category, condition, rule_ids }` |

#### rule_status ごとの画面表示の例

| rule_status | 意味 | category | 画面表示の例 |
|---|---|---|---|
| `applied` | 公式ルールに該当し、条件も確認できた | 区分名 | 「**資源化物（缶・びん・ペットボトル）** に出してください」＋出し方 |
| `needs_confirmation` | 候補はあるが、材質・状態などが分からず決められない | null | 「次のどちらかです」＋ `candidates` の条件を表示＋ `questions_for_user` |
| `not_found` | ルールはあるが、この品目の記載がない | null | 「自治体の公式情報を確認してください」 |
| `no_rules` | ルールが渡されていない | null | 「自治体の公式情報を確認してください」 |

## 列挙値の日本語表示（画面用）

| 値 | 表示 |
|---|---|
| `high` / `medium` / `low` | 高い / 中くらい / 低い |
| `observed` / `inferred` / `unknown` | 表示で確認 / 推測 / 不明 |
| `yes` / `no` / `unknown` | 複数素材 / 単一素材 / 不明 |
| `dark` | 暗い |
| `overexposed` | 明るすぎ・反射 |
| `blurry` | ぼやけている |
| `too_far` | 遠い・小さい |
| `partially_hidden` | 一部が隠れている |
| `label_unreadable` | 表示が読めない |
| `cluttered` | 物が重なっている |

> 列挙値を英語のコードにしたのは、プログラムで条件分岐するときに表記ゆれが起きないようにするためです。人が読む文章の項目はすべて日本語です（依頼のルール5）。

## 出力例（那覇市ルール・ペットボトル）

[eval/samples/example_TC01_naha.json](../eval/samples/example_TC01_naha.json)

> ⚠️ これは仕様説明のために**手で書いた例**で、Geminiが実際に出力したものではありません。

```json
{
  "schema_version": "1.0",
  "image_assessment": { "overall_quality": "good", "issues": [], "contains_waste": true, "retake_advice": null },
  "items": [
    {
      "id": "item_1",
      "name": "ペットボトル",
      "name_candidates": [],
      "description": "透明な500ml程度の飲料用ボトル。青いキャップと、緑色のフィルムラベルが付いている。",
      "location": "画像中央",
      "quantity": 1,
      "confidence": "high",
      "confidence_reason": "飲料用ペットボトル特有の形状がはっきり写っており、ラベルにPETマークが読めるため。",
      "components": [
        { "part": "本体", "material": "PET（ポリエチレンテレフタレート）", "material_basis": "observed", "evidence": "ラベルにPET 1の識別マークが読める。" },
        { "part": "キャップ", "material": "プラスチック", "material_basis": "inferred", "evidence": "表示は見えないが、形状と質感からプラスチック製と推測されます。" },
        { "part": "ラベル", "material": "プラスチック（フィルム）", "material_basis": "inferred", "evidence": "薄く光沢のあるフィルム状のため、プラスチック製と推測されます。" }
      ],
      "is_composite": "yes",
      "sorting": [
        { "target": "本体", "rule_status": "applied", "category": "資源化物（缶・びん・ペットボトル）",
          "disposal_method": "キャップとラベルを取り、中を空にして軽くすすぎ、なるべくつぶして透明の袋に入れて出す。", "rule_ids": ["N03"], "candidates": [] },
        { "target": "キャップ", "rule_status": "applied", "category": "もやすごみ",
          "disposal_method": "プラキャップは指定ごみ袋（赤）に入れて、もやすごみで出す。", "rule_ids": ["N03", "N01"], "candidates": [] },
        { "target": "ラベル", "rule_status": "applied", "category": "もやすごみ",
          "disposal_method": "プラスチック類として指定ごみ袋（赤）に入れて出す。", "rule_ids": ["N01"], "candidates": [] }
      ],
      "cautions": [
        { "type": "official_rule", "text": "キャップとラベルを取ってから出してください。" },
        { "type": "official_rule", "text": "中身を空にして軽くすすいでください。" }
      ],
      "unknowns": ["中身が残っているか"],
      "questions_for_user": ["ボトルの中身は空になっていますか？"]
    }
  ],
  "overall_notes": null
}
```

### ルール未提供のときの sorting の例

```json
{ "target": "本体", "rule_status": "no_rules", "category": null,
  "disposal_method": "自治体の公式情報を確認してください", "rule_ids": [], "candidates": [] }
```

### 確定できないとき（needs_confirmation）の例

```json
{ "target": "全体", "rule_status": "needs_confirmation", "category": null,
  "disposal_method": "自治体の公式情報を確認してください", "rule_ids": [],
  "candidates": [
    { "category": "資源化物（缶・びん・ペットボトル）", "condition": "PETマークがある場合", "rule_ids": ["N03"] },
    { "category": "もやすごみ", "condition": "PETマークがない場合", "rule_ids": ["N03"] }
  ] }
```

## バックエンドで扱うときの注意

1. **スキーマで検証してから使う**：Geminiの出力がスキーマに合わない可能性はゼロではありません。`response_schema.json` で検証し、合わない場合は1回だけ再試行し、それでも駄目なら「判定できませんでした」と表示するのが安全です。
2. **`category` が null のときに区分を表示しない**：区分名を独自に補わないでください。
3. **`applied` の区分名は自治体ルールの区分一覧と照らし合わせる**：ルールにない区分名が来たら `needs_confirmation` 扱いにするのが安全です。照合方法は [eval/src/scorer.ts](../eval/src/scorer.ts) の `inv.rule_grounding` と同じです。
4. **区分名の比較は正規化してから行う**：Geminiが全角括弧「（）」と半角括弧「()」を混ぜる可能性があるため、NFKC正規化（文字の表記を統一する処理）をしてから比べてください。
5. **`schema_version` を確認する**：形式を変えるときはバージョンを上げて連絡します。
