# 2. JSON出力形式 仕様書（schema_version 2.0）

対象：バックエンド・フロントエンド担当
正式な定義：[prompts/response_schema.json](../prompts/response_schema.json)（このファイルと食い違う場合はスキーマが正）

> v1.0（分別全般）から形式が変わりました。`components`・`sorting`・`category`・`disposal_method` はなくなり、`size_estimate`・`has_spring`・`sodai` が増えました。

## 全体の構造

```
{
  schema_version            "2.0"
  image_assessment          画像全体の評価
    overall_quality         good | fair | poor
    issues[]                dark | overexposed | blurry | too_far | partially_hidden | no_scale_reference | cluttered
    contains_waste          true / false
    retake_advice           撮り直しのアドバイス or null
  items[]                   認識した物（0件のこともある）
    id                      item_1, item_2 …
    name                    物の名前（不明なら「不明な物体」）
    name_candidates[]       他の候補
    description             見た目の特徴
    location                画像内の位置
    quantity                個数 or null
    confidence              high | medium | low
    confidence_reason       確実性の理由
    size_estimate           大きさ・重さの見積もり
      dimensions / weight / basis (observed|inferred|unknown) / evidence
    has_spring              yes | no | unknown | not_applicable
    sodai                   品目リストとの照合結果
      status                listed | needs_confirmation | not_collected | not_sodai | not_listed
      list_ids[]            品目ID（S…）または収集しない物のID（X…）
      candidates[]          { list_id, condition }
      reason                判定の理由
    cautions[]              注意事項 { type: general_safety | image_observation, text }
    unknowns[]              画像では判断できない情報
    questions_for_user[]    ユーザーへの確認質問
  overall_notes             補足 or null
}
```

**料金・処理券・販売店・出し方は含まれません。** `sodai` のIDを使って、アプリが [data/](../data/README.md) から表示します。

## sodai.status ごとの意味と画面表示

| status | 意味 | list_ids | candidates | 画面表示（詳しくは [data/README.md](../data/README.md)） |
|---|---|---|---|---|
| `listed` | 品目を1つに特定できた | 品目ID 1つ | [] | 品目名・料金・処理券・販売店 |
| `needs_confirmation` | 候補はあるが決められない（小か大か、スプリングの有無など） | [] | 2つ以上 | 候補ごとに「条件 → 料金」＋ `questions_for_user` |
| `not_collected` | 市で収集しない物（テレビ・パソコンなど） | X… のID | [] | 「市では収集していません」＋案内 |
| `not_sodai` | 指定ごみ袋に入る普通のごみと思われる | [] | [] | 「そ大ごみではない可能性」＋ごみの出し方ページ |
| `not_listed` | 大きいが品目リストにない | [] | [] | 「クリーン推進課に確認してください」 |

## 各項目の意味（v2.0 で増えたもの）

| 項目 | 型 | 意味・使い方 |
|---|---|---|
| `size_estimate.dimensions` | string | 大きさの目安（例：「幅約50cm×奥行約50cm×高さ約80cmと推測」）。分からなければ「不明」 |
| `size_estimate.weight` | string | 重さの目安（例：「10kg以下と推測」）。分からなければ「不明」 |
| `size_estimate.basis` | enum | `observed`：寸法表示や比べられる物から明白 / `inferred`：推測 / `unknown`：判断できない |
| `has_spring` | enum | スプリングの有無。見た目だけでは `unknown`。家具・寝具以外は `not_applicable` |
| `sodai.reason` | string | 判定の理由。画面に「判定の理由」として出せる |
| `issues` の `no_scale_reference` | — | 大きさを比べる物が写っていない。撮り直しの案内に使う |

その他の項目（`name`・`confidence`・`unknowns` など）の意味は v1.0 と同じです。

## 列挙値の日本語表示（画面用）

| 値 | 表示 |
|---|---|
| `high` / `medium` / `low` | 高い / 中くらい / 低い |
| `observed` / `inferred` / `unknown` | 確認済み / 推測 / 不明 |
| `yes` / `no` / `unknown` | スプリングあり / スプリングなし / 不明 |
| `no_scale_reference` | 大きさの目安がない |
| その他の `issues` | v1.0 と同じ（暗い、明るすぎ・反射、ぼやけている、遠い・小さい、一部が隠れている、物が重なっている） |

## 出力例（那覇市・椅子）

[eval/samples/example_TC01_naha.json](../eval/samples/example_TC01_naha.json)

> ⚠️ これは仕様説明のために**手で書いた例**で、Geminiが実際に出力したものではありません。

```json
{
  "schema_version": "2.0",
  "image_assessment": { "overall_quality": "good", "issues": [], "contains_waste": true, "retake_advice": null },
  "items": [
    {
      "id": "item_1",
      "name": "椅子",
      "name_candidates": [],
      "description": "灰色の布張りの座面と金属の脚を持つ、会議用の椅子と推測されます。",
      "location": "画像中央",
      "quantity": 1,
      "confidence": "high",
      "confidence_reason": "背もたれ・座面・4本の脚がはっきり写っているため。",
      "size_estimate": { "dimensions": "幅約50cm×奥行約50cm×高さ約80cmと推測", "weight": "10kg以下と推測", "basis": "inferred", "evidence": "床のタイルの大きさとの比較からの推測です。" },
      "has_spring": "no",
      "sodai": {
        "status": "needs_confirmation",
        "list_ids": [],
        "candidates": [
          { "list_id": "S011", "condition": "1立方メートル未満かつ10kg以下の場合" },
          { "list_id": "S012", "condition": "1立方メートル以上、または10kgを超える場合" }
        ],
        "reason": "椅子（スプリングなし）に当たると推測されますが、重さが10kgを超えるか画像からは判断できないため。"
      },
      "cautions": [{ "type": "image_observation", "text": "脚にキャスターが付いているように見えます。" }],
      "unknowns": ["正確な重さ"],
      "questions_for_user": ["椅子の重さは10kgを超えますか？"]
    }
  ],
  "overall_notes": null
}
```

この例の画面表示：「椅子（スプリングなし）— 10kg以下なら 300円（処理券1枚）／10kgを超えるなら 600円（処理券2枚）」＋「椅子の重さは10kgを超えますか？」

## バックエンドで扱うときの注意

1. **スキーマで検証してから使う**：合わない場合は1回だけ再試行し、それでも駄目なら「判定できませんでした」と表示するのが安全です。
2. **IDを data/ で引けるか確認する**：見つからないIDが来たら、その品目は `needs_confirmation` 扱いにして料金を表示しないでください（照合方法は [eval/src/scorer.ts](../eval/src/scorer.ts) の `inv.rule_grounding` と同じ）。
3. **料金をAIの文章から拾わない**：料金は必ず `data/naha-sodai-items.json` の `fee_yen` と `ticket` から表示してください。
4. **ユーザーの回答で再判定する**：`questions_for_user` に答えてもらったら、その内容を `{{USER_NOTE}}` に入れて、もう一度呼び出すと `listed` に確定できることがあります。
5. **`schema_version` を確認する**：形式を変えるときはバージョンを上げて連絡します。
