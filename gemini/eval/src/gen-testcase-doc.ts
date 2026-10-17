// test-cases.json から docs/03_test_cases.md を生成する（手で書き写すとずれるため）。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRules } from "./scorer.js";

const EVAL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const suite = JSON.parse(readFileSync(join(EVAL_DIR, "test-cases.json"), "utf8"));
const CONF: Record<string, string> = { high: "高", medium: "中", low: "低" };
const RULES: Record<string, string> = { naha: "那覇市", sample: "架空のサンプル市" };
const ISSUE: Record<string, string> = { dark: "暗い", blurry: "ぼやけ" };
const STATUS: Record<string, string> = {
  listed: "品目を特定", needs_confirmation: "要確認（候補あり）", not_collected: "市で収集しない", not_sodai: "そ大ごみではない", not_listed: "リストにない",
};
const esc = (s: string) => s.replace(/\|/g, "\\|");

// ID に品目名を添える（例：S011 椅子（スプリングなし）小）
const names = new Map<string, string>();
for (const key of Object.keys(suite.rule_sets)) {
  const r = loadRules(join(EVAL_DIR, suite.rule_sets[key].file));
  for (const [id, name] of r.items) names.set(id, name.split("｜").pop()!.replace(/\s+/g, ""));
}
const label = (id: string) => (names.has(id) ? `${id}（${names.get(id)}）` : id);

const images = [...new Set(suite.cases.map((c: any) => c.image))];

const out: string[] = [
  "# 3. 画像認識テストケース一覧（v2.0 そ大ごみ版）", "",
  "> このファイルは `eval/test-cases.json` から自動生成しています（`npm run docs`）。直接編集せず、JSONを直してから生成し直してください。", "",
  "## 評価項目", "",
  "| No. | 評価項目 | 主な自動チェック |", "|---|---|---|",
  "| 1 | 物体名を正しく認識できるか | `exp.item[*].name`, `confidence_min` |",
  "| 2 | 正しい品目IDを選べるか（確定または候補に含むか） | `exp.item[*].ids` |",
  "| 3 | 写っていない物を回答していないか | `exp.no_hallucinated_items`, `item_count`, `contains_waste` |",
  "| 4 | 大きさ・重さ・スプリングを根拠なく断定していないか | `inv.no_unfounded_variant`, `inv.unknown_size`, `inv.poor_quality_no_high`, `exp.confidence_max*` |",
  "| 5 | 複数の物を認識できるか | `exp.item_count`（2件以上） |",
  "| 6 | 指定したJSON形式で回答できるか | `json.schema`, `inv.japanese`, `inv.item_ids` |",
  "| 7 | 品目リストに忠実か | `inv.rule_grounding`, `inv.status_shape`, `inv.no_fee`, `exp.item[*].status`, `ids_forbidden` |", "",
  "**どのケースでも必ず確認する条件（不変条件）**：存在しない品目IDを使っていない／ステータスと `list_ids`・`candidates` の形が合っている／「小・大」「スプリングあり・なし」の区別がある品目を根拠なく確定していない／料金・処理券に触れていない／大きさ unknown なら「不明」／品質 poor なら high にしない。", "",
  "## 合格基準", "",
  "- 各ケース：自動チェックがすべて ✅、かつ目視チェックで重大な問題（誤った品目の確定、写っていない物の回答）がないこと",
  "- 全体（ハッカソンでの目標）：評価項目6・7の不変条件は **100%**、それ以外の自動チェックは **80%以上**",
  "- ばらつき確認：主要ケース（TC01, TC07, TC08, TC10, TC14）は `--repeat 3` で3回とも合格すること", "",
  `必要な画像は **${images.length} 枚**です（TC18 は TC01 の画像を使い回します）。会場で撮りやすいのは TC01〜03・06・11〜17 です。`, "",
  "## 一覧", "",
  "| ID | グループ | 内容 | 品目リスト | 評価項目 |", "|---|---|---|---|---|",
  ...suite.cases.map((c: any) => `| ${c.id} | ${c.group} | ${esc(c.title)} | ${RULES[c.rules]} | ${c.eval_items.join(", ")} |`),
  "", "## 各ケースの詳細", "",
];

for (const c of suite.cases) {
  const e = c.expected;
  out.push(`### ${c.id} ${c.title}`, "");
  out.push(`- **画像**：\`eval/images/${c.image}.jpg\` など（${c.how_to_shoot}）`);
  out.push(`- **渡す品目リスト**：${RULES[c.rules]}${c.user_note ? ` / 補足：${c.user_note}` : ""}`);
  out.push(`- **期待する画像評価**：捨てる物${e.contains_waste ? "あり" : "なし"}、物体数 ${e.item_count.min === e.item_count.max ? e.item_count.min : `${e.item_count.min}〜${e.item_count.max}`} 件` +
    (e.quality_issues_any ? `、問題点に「${e.quality_issues_any.map((q: string) => ISSUE[q] ?? q).join("・")}」` : "") +
    (e.retake_advice_required ? "、撮り直しの案内あり" : "") +
    (e.confidence_max_all ? `、確実性はすべて「${CONF[e.confidence_max_all]}」以下` : "") +
    (e.size_basis_forbidden_all ? "、大きさを observed（確認済み）にしない" : ""));
  for (const it of e.items) {
    const parts = [`物体名に「${it.name_any.join("／")}」を含む`];
    if (it.confidence_min) parts.push(`確実性「${CONF[it.confidence_min]}」以上`);
    if (it.confidence_max) parts.push(`確実性「${CONF[it.confidence_max]}」以下`);
    if (it.status_any) parts.push(`判定：${it.status_any.map((s: string) => STATUS[s]).join("／")}`);
    if (it.ids_any) parts.push(`品目ID：${it.ids_any.map(label).join("、")} のいずれか`);
    if (it.ids_forbidden) parts.push(`**確定してはいけないID**：${it.ids_forbidden.map(label).join("、")}`);
    if (it.has_spring_any) parts.push(`スプリング：${it.has_spring_any.join("/")}`);
    out.push(`- **期待する認識（${it.label}）**：${parts.join("、")}`);
  }
  if (e.forbidden_item_names.length) out.push(`- **写っていないので答えてはいけない物**：${e.forbidden_item_names.join("、")}`);
  out.push(`- **目視チェック**：`, ...c.manual_checks.map((m: string) => `  - ${m}`), "");
}
writeFileSync(resolve(EVAL_DIR, "../docs/03_test_cases.md"), out.join("\n"));
console.log("docs/03_test_cases.md を生成しました");
