// test-cases.json から docs/03_test_cases.md を生成する（手で書き写すとずれるため）。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EVAL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const suite = JSON.parse(readFileSync(join(EVAL_DIR, "test-cases.json"), "utf8"));
const CONF: Record<string, string> = { high: "高", medium: "中", low: "低" };
const RULES: Record<string, string> = { naha: "那覇市", sample: "架空のサンプル市", none: "提供なし" };
const ISSUE: Record<string, string> = { dark: "暗い", blurry: "ぼやけ" };
const esc = (s: string) => s.replace(/\|/g, "\\|");

const out: string[] = [
  "# 3. 画像認識テストケース一覧", "",
  "> このファイルは `eval/test-cases.json` から自動生成しています（`npm run docs`）。直接編集せず、JSONを直してから生成し直してください。", "",
  "## 評価項目", "",
  "| No. | 評価項目 | 主な自動チェック |", "|---|---|---|",
  "| 1 | 物体名を正しく認識できるか | `exp.item[*].name`, `confidence_min` |",
  "| 2 | 材質を適切に判断できるか | `exp.item[*].material`, `composite` |",
  "| 3 | 写っていない物を回答していないか | `exp.no_hallucinated_items`, `item_count`, `contains_waste` |",
  "| 4 | 不明な情報を無理に断定していないか | `inv.poor_quality_no_high`, `exp.confidence_max*`, `exp.material_not_asserted` |",
  "| 5 | 複数のゴミを認識できるか | `exp.item_count`（2件以上） |",
  "| 6 | 指定したJSON形式で回答できるか | `json.schema`, `inv.japanese`, `inv.item_ids` |",
  "| 7 | 自治体の公式ルールと回答が一致しているか | `exp.item[*].category*`, `inv.rule_grounding`, `inv.fixed_message` |", "",
  "**どのケースでも必ず確認する条件（不変条件）**：存在しないルールIDや区分名を使っていない／`applied` 以外の処分方法は固定文言／ルール未提供のときは全て `no_rules`／材質 unknown なら「不明」／品質 poor なら high にしない。", "",
  "## 合格基準", "",
  "- 各ケース：自動チェックがすべて ✅、かつ目視チェックで重大な問題（誤った分別の断定、写っていない物の回答）がないこと",
  "- 全体（ハッカソンでの目標）：評価項目6・7の不変条件は **100%**、それ以外の自動チェックは **80%以上**",
  "- ばらつき確認：主要ケース（TC01, TC05, TC09, TC12, TC15）は `--repeat 3` で3回とも合格すること", "",
  "## 一覧", "",
  "| ID | グループ | 内容 | ルール | 評価項目 |", "|---|---|---|---|---|",
  ...suite.cases.map((c: any) => `| ${c.id} | ${c.group} | ${esc(c.title)} | ${RULES[c.rules]} | ${c.eval_items.join(", ")} |`),
  "", "## 各ケースの詳細", "",
];

for (const c of suite.cases) {
  const e = c.expected;
  out.push(`### ${c.id} ${c.title}`, "");
  out.push(`- **画像**：\`eval/images/${c.image}.jpg\`（${c.how_to_shoot}）`);
  out.push(`- **渡すルール**：${RULES[c.rules]}${c.user_note ? ` / 補足：${c.user_note}` : ""}`);
  out.push(`- **期待する画像評価**：ゴミ${e.contains_waste ? "あり" : "なし"}、物体数 ${e.item_count.min === e.item_count.max ? e.item_count.min : `${e.item_count.min}〜${e.item_count.max}`} 件` +
    (e.quality_issues_any ? `、問題点に「${e.quality_issues_any.map((q: string) => ISSUE[q] ?? q).join("・")}」` : "") +
    (e.retake_advice_required ? "、撮り直しの案内あり" : "") +
    (e.confidence_max_all ? `、確実性はすべて「${CONF[e.confidence_max_all]}」以下` : "") +
    (e.material_basis_forbidden_all ? "、材質を observed（確認済み）にしない" : "") +
    (e.forbid_all_items_high_confidence_same_name ? "、全部を同じ名前で「高」と断定しない" : ""));
  for (const it of e.items) {
    const parts = [`物体名に「${it.name_any.join("／")}」を含む`];
    if (it.material_any) parts.push(`材質に「${it.material_any.join("／")}」を含む`);
    if (it.composite_any) parts.push(`複数素材：${it.composite_any.join("/")}`);
    if (it.confidence_min) parts.push(`確実性「${CONF[it.confidence_min]}」以上`);
    if (it.confidence_max) parts.push(`確実性「${CONF[it.confidence_max]}」以下`);
    const s = it.sorting;
    if (s?.status_any) parts.push(`rule_status：${s.status_any.join("/")}`);
    if (s?.categories_required) parts.push(`区分「${s.categories_required.join("」「")}」`);
    if (s?.categories_required_if_applied) parts.push(`確定する場合は区分「${s.categories_required_if_applied.join("」「")}」`);
    if (s?.categories_forbidden) parts.push(`**NG区分**「${s.categories_forbidden.join("」「")}」`);
    out.push(`- **期待する認識（${it.label}）**：${parts.join("、")}`);
  }
  if (e.forbidden_item_names.length) out.push(`- **写っていないので答えてはいけない物**：${e.forbidden_item_names.join("、")}`);
  out.push(`- **目視チェック**：`, ...c.manual_checks.map((m: string) => `  - ${m}`), "");
}
writeFileSync(resolve(EVAL_DIR, "../docs/03_test_cases.md"), out.join("\n"));
console.log("docs/03_test_cases.md を生成しました");
