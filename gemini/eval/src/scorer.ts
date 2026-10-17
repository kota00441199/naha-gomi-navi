// Gemini の回答（JSON）を、スキーマ・不変条件・テストケースの期待値で採点する。
// 採点は自動でできる範囲だけ。目視が必要な項目は manual_checks としてレポートに残す。
import { readFileSync } from "node:fs";
import { Ajv } from "ajv";

export const FIXED_MESSAGE = "自治体の公式情報を確認してください";

export type Confidence = "high" | "medium" | "low";
const CONF_RANK: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };

export interface SortingEntry {
  target: string;
  rule_status: "applied" | "needs_confirmation" | "not_found" | "no_rules";
  category: string | null;
  disposal_method: string;
  rule_ids: string[];
  candidates: { category: string; condition: string; rule_ids: string[] }[];
}
export interface Item {
  id: string;
  name: string;
  name_candidates: string[];
  description: string;
  location: string;
  quantity: number | null;
  confidence: Confidence;
  confidence_reason: string;
  components: { part: string; material: string; material_basis: "observed" | "inferred" | "unknown"; evidence: string }[];
  is_composite: "yes" | "no" | "unknown";
  sorting: SortingEntry[];
  cautions: { type: string; text: string }[];
  unknowns: string[];
  questions_for_user: string[];
}
export interface GomiResponse {
  schema_version: string;
  image_assessment: { overall_quality: "good" | "fair" | "poor"; issues: string[]; contains_waste: boolean; retake_advice: string | null };
  items: Item[];
  overall_notes: string | null;
}

export interface ExpectedItem {
  label: string;
  name_any: string[];
  material_any?: string[];
  composite_any?: string[];
  confidence_min?: Confidence;
  confidence_max?: Confidence;
  sorting?: {
    status_any?: string[];
    categories_required?: string[];
    categories_required_if_applied?: string[];
    categories_forbidden?: string[];
  };
}
export interface Expected {
  contains_waste: boolean;
  item_count: { min: number; max: number };
  items: ExpectedItem[];
  forbidden_item_names: string[];
  quality_issues_any?: string[];
  retake_advice_required?: boolean;
  confidence_max_all?: Confidence;
  material_basis_forbidden_all?: string[];
  forbid_all_items_high_confidence_same_name?: boolean;
}

/** 評価項目（依頼書の1〜7）。0 は「回答全体の整合性」 */
export type EvalItem = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface Check {
  id: string;
  eval_item: EvalItem;
  passed: boolean;
  detail: string;
}

export interface RulesContext {
  /** null = ルール未提供 */
  text: string | null;
  ruleIds: Set<string>;
  categories: Set<string>;
}

/** 全角・半角や空白の違いで不一致にならないように正規化する */
export const norm = (s: string) => s.normalize("NFKC").replace(/\s+/g, "");

export function loadRules(path: string | null): RulesContext {
  if (!path) return { text: null, ruleIds: new Set(), categories: new Set() };
  const text = readFileSync(path, "utf8");
  const ruleIds = new Set([...text.matchAll(/^\[([A-Z]\d+)\]/gm)].map((m) => m[1]));
  const categories = new Set([...text.matchAll(/^\[[A-Z]\d+\]\s*区分[:：](.+)$/gm)].map((m) => norm(m[1])));
  return { text, ruleIds, categories };
}

const schema = JSON.parse(readFileSync(new URL("../../prompts/response_schema.json", import.meta.url), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const JA = /[぀-ヿ一-鿿]/;

export function checkSchema(raw: string): { checks: Check[]; parsed: GomiResponse | null } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { checks: [{ id: "json.parse", eval_item: 6, passed: false, detail: `JSONとして読めない: ${(e as Error).message}` }], parsed: null };
  }
  const ok = validate(parsed) as boolean;
  const detail = ok ? "スキーマに適合" : ajv.errorsText(validate.errors, { separator: " / " });
  return { checks: [{ id: "json.schema", eval_item: 6, passed: ok, detail }], parsed: ok ? (parsed as GomiResponse) : null };
}

/** どのテストケースでも成り立つべき条件 */
export function checkInvariants(r: GomiResponse, rules: RulesContext): Check[] {
  const checks: Check[] = [];
  const add = (id: string, eval_item: EvalItem, passed: boolean, detail: string) => checks.push({ id, eval_item, passed, detail });
  const problems = (list: string[]) => (list.length ? list.join(" / ") : "OK");

  // 画像の評価と items の整合
  const wasteMismatch = r.image_assessment.contains_waste === (r.items.length === 0);
  add("inv.contains_waste", 3, !wasteMismatch, wasteMismatch ? `contains_waste=${r.image_assessment.contains_waste} なのに items が ${r.items.length} 件` : "OK");

  const ids = r.items.map((i) => i.id);
  const expectedIds = r.items.map((_, n) => `item_${n + 1}`);
  add("inv.item_ids", 6, ids.join() === expectedIds.join(), ids.join() === expectedIds.join() ? "OK" : `id が連番でない: ${ids.join(",")}`);

  // 品質が悪いのに high はつけない
  const highOnPoor = r.image_assessment.overall_quality === "poor" ? r.items.filter((i) => i.confidence === "high").map((i) => i.id) : [];
  add("inv.poor_quality_no_high", 4, highOnPoor.length === 0, highOnPoor.length ? `品質 poor なのに high: ${highOnPoor.join(",")}` : "OK");

  // 材質 unknown なら「不明」
  const badUnknown: string[] = [];
  const japanese: string[] = [];
  const ruleProblems: string[] = [];
  const fixedMsgProblems: string[] = [];
  const statusProblems: string[] = [];

  for (const item of r.items) {
    for (const c of item.components) {
      if (c.material_basis === "unknown" && norm(c.material) !== "不明") badUnknown.push(`${item.id}/${c.part}: "${c.material}"`);
    }
    for (const [field, value] of [["name", item.name], ["description", item.description], ["confidence_reason", item.confidence_reason]] as const) {
      if (!JA.test(value)) japanese.push(`${item.id}.${field}`);
    }
    for (const s of item.sorting) {
      const where = `${item.id}/${s.target}`;
      // ルールの有無と rule_status の整合
      if (rules.text === null && s.rule_status !== "no_rules") statusProblems.push(`${where}: ルール未提供なのに ${s.rule_status}`);
      if (rules.text !== null && s.rule_status === "no_rules") statusProblems.push(`${where}: ルールがあるのに no_rules`);

      if (s.rule_status === "applied") {
        if (!s.category) ruleProblems.push(`${where}: applied なのに category が空`);
        else if (!rules.categories.has(norm(s.category))) ruleProblems.push(`${where}: ルールにない区分名「${s.category}」`);
        if (s.rule_ids.length === 0) ruleProblems.push(`${where}: applied なのに rule_ids が空`);
        for (const id of s.rule_ids) if (!rules.ruleIds.has(id)) ruleProblems.push(`${where}: 存在しないルールID「${id}」`);
      } else {
        if (s.category !== null) fixedMsgProblems.push(`${where}: ${s.rule_status} なのに category="${s.category}"`);
        if (s.disposal_method !== FIXED_MESSAGE) fixedMsgProblems.push(`${where}: 固定文言でない「${s.disposal_method}」`);
        if (s.rule_ids.length) fixedMsgProblems.push(`${where}: ${s.rule_status} なのに rule_ids あり`);
      }
      if (s.rule_status === "needs_confirmation") {
        if (s.candidates.length === 0) ruleProblems.push(`${where}: needs_confirmation なのに candidates が空`);
        for (const c of s.candidates) {
          if (!rules.categories.has(norm(c.category))) ruleProblems.push(`${where}: 候補にルールにない区分名「${c.category}」`);
          for (const id of c.rule_ids) if (!rules.ruleIds.has(id)) ruleProblems.push(`${where}: 候補に存在しないルールID「${id}」`);
        }
      } else if (s.rule_status !== "applied" && s.candidates.length) {
        ruleProblems.push(`${where}: ${s.rule_status} なのに candidates あり`);
      }
    }
    if (rules.text === null) {
      const leaked = item.cautions.filter((c) => c.type === "official_rule").map((c) => c.text);
      if (leaked.length) ruleProblems.push(`${item.id}: ルール未提供なのに official_rule の注意事項: ${leaked.join(" / ")}`);
    }
  }
  add("inv.unknown_material", 4, badUnknown.length === 0, problems(badUnknown));
  add("inv.japanese", 6, japanese.length === 0, japanese.length ? `日本語でない項目: ${japanese.join(",")}` : "OK");
  add("inv.rule_status", 7, statusProblems.length === 0, problems(statusProblems));
  add("inv.rule_grounding", 7, ruleProblems.length === 0, problems(ruleProblems));
  add("inv.fixed_message", 7, fixedMsgProblems.length === 0, problems(fixedMsgProblems));
  return checks;
}

function findItem(items: Item[], exp: ExpectedItem, used: Set<Item>): Item | undefined {
  const keys = exp.name_any.map(norm);
  return items.find((i) => !used.has(i) && keys.some((k) => norm(i.name).includes(k)));
}

/** テストケースごとの期待値との比較 */
export function checkExpected(r: GomiResponse, exp: Expected): Check[] {
  const checks: Check[] = [];
  const add = (id: string, eval_item: EvalItem, passed: boolean, detail: string) => checks.push({ id, eval_item, passed, detail });

  add("exp.contains_waste", 3, r.image_assessment.contains_waste === exp.contains_waste, `期待 ${exp.contains_waste} / 実際 ${r.image_assessment.contains_waste}`);

  const n = r.items.length;
  const countOk = n >= exp.item_count.min && n <= exp.item_count.max;
  add("exp.item_count", exp.item_count.max > 1 ? 5 : 3, countOk, `期待 ${exp.item_count.min}〜${exp.item_count.max} 件 / 実際 ${n} 件（${r.items.map((i) => i.name).join("、")}）`);

  const forbidden = r.items.filter((i) => exp.forbidden_item_names.some((f) => norm(i.name).includes(norm(f))));
  add("exp.no_hallucinated_items", 3, forbidden.length === 0, forbidden.length ? `写っていないはずの物: ${forbidden.map((i) => i.name).join("、")}` : "OK");

  if (exp.quality_issues_any) {
    const hit = exp.quality_issues_any.some((q) => r.image_assessment.issues.includes(q));
    add("exp.quality_issue", 4, hit, `期待 ${exp.quality_issues_any.join("|")} / 実際 [${r.image_assessment.issues.join(",")}]`);
  }
  if (exp.retake_advice_required) {
    add("exp.retake_advice", 4, !!r.image_assessment.retake_advice, r.image_assessment.retake_advice ?? "null");
  }
  if (exp.confidence_max_all) {
    const max = exp.confidence_max_all;
    const over = r.items.filter((i) => CONF_RANK[i.confidence] > CONF_RANK[max]);
    add("exp.confidence_max_all", 4, over.length === 0, over.length ? `${max} を超える: ${over.map((i) => `${i.name}=${i.confidence}`).join("、")}` : "OK");
  }
  if (exp.material_basis_forbidden_all) {
    const bad = r.items.flatMap((i) => i.components.filter((c) => exp.material_basis_forbidden_all!.includes(c.material_basis)).map((c) => `${i.name}/${c.part}=${c.material}(${c.material_basis})`));
    add("exp.material_not_asserted", 4, bad.length === 0, bad.length ? `材質を断定: ${bad.join("、")}` : "OK");
  }
  if (exp.forbid_all_items_high_confidence_same_name && r.items.length >= 2) {
    const allSame = r.items.every((i) => i.confidence === "high" && norm(i.name) === norm(r.items[0].name));
    add("exp.similar_items_distinguished", 4, !allSame, allSame ? `すべて「${r.items[0].name}」high で断定` : "OK");
  }

  const used = new Set<Item>();
  for (const e of exp.items) {
    const item = findItem(r.items, e, used);
    add(`exp.item[${e.label}].name`, 1, !!item, item ? `「${item.name}」` : `「${e.name_any.join("|")}」を含む物体名が見つからない`);
    if (!item) continue;
    used.add(item);

    if (e.material_any) {
      const mats = item.components.map((c) => c.material);
      const ok = mats.some((m) => e.material_any!.some((k) => norm(m).includes(norm(k))));
      add(`exp.item[${e.label}].material`, 2, ok, `期待 ${e.material_any.join("|")} / 実際 ${mats.join("、")}`);
    }
    if (e.composite_any) {
      add(`exp.item[${e.label}].composite`, 2, e.composite_any.includes(item.is_composite), `期待 ${e.composite_any.join("|")} / 実際 ${item.is_composite}`);
    }
    if (e.confidence_min) {
      add(`exp.item[${e.label}].confidence_min`, 1, CONF_RANK[item.confidence] >= CONF_RANK[e.confidence_min], `期待 ${e.confidence_min} 以上 / 実際 ${item.confidence}`);
    }
    if (e.confidence_max) {
      add(`exp.item[${e.label}].confidence_max`, 4, CONF_RANK[item.confidence] <= CONF_RANK[e.confidence_max], `期待 ${e.confidence_max} 以下 / 実際 ${item.confidence}`);
    }
    const s = e.sorting;
    if (!s) continue;
    const statuses = item.sorting.map((x) => x.rule_status);
    const applied = item.sorting.filter((x) => x.rule_status === "applied").map((x) => norm(x.category ?? ""));
    if (s.status_any) {
      const ok = statuses.length > 0 && statuses.every((st) => s.status_any!.includes(st));
      add(`exp.item[${e.label}].rule_status`, 7, ok, `期待 ${s.status_any.join("|")} / 実際 ${statuses.join(",") || "（sorting なし）"}`);
    }
    const required = [...(s.categories_required ?? []), ...(applied.length ? s.categories_required_if_applied ?? [] : [])];
    if (required.length) {
      const missing = required.filter((c) => !applied.includes(norm(c)));
      add(`exp.item[${e.label}].category`, 7, missing.length === 0, missing.length ? `不足: ${missing.join("、")} / 実際 ${item.sorting.map((x) => `${x.target}=${x.category ?? x.rule_status}`).join("、")}` : "OK");
    }
    if (s.categories_forbidden?.length) {
      const hit = s.categories_forbidden.filter((c) => applied.includes(norm(c)));
      add(`exp.item[${e.label}].category_forbidden`, 7, hit.length === 0, hit.length ? `誤った区分: ${hit.join("、")}` : "OK");
    }
  }
  return checks;
}
