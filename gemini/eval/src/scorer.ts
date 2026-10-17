// Gemini の回答（JSON）を、スキーマ・不変条件・テストケースの期待値で採点する。
// 採点は自動でできる範囲だけ。目視が必要な項目は manual_checks としてレポートに残す。
import { readFileSync } from "node:fs";
import { Ajv } from "ajv";

export type Confidence = "high" | "medium" | "low";
const CONF_RANK: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };

export type SodaiStatus = "listed" | "needs_confirmation" | "not_collected" | "not_sodai" | "not_listed";
export interface Item {
  id: string;
  name: string;
  name_candidates: string[];
  description: string;
  location: string;
  quantity: number | null;
  confidence: Confidence;
  confidence_reason: string;
  size_estimate: { dimensions: string; weight: string; basis: "observed" | "inferred" | "unknown"; evidence: string };
  has_spring: "yes" | "no" | "unknown" | "not_applicable";
  sodai: { status: SodaiStatus; list_ids: string[]; candidates: { list_id: string; condition: string }[]; reason: string };
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
  confidence_min?: Confidence;
  confidence_max?: Confidence;
  status_any?: SodaiStatus[];
  /** list_ids か candidates のどちらかに、このうち1つ以上が入っていること */
  ids_any?: string[];
  /** list_ids（確定した品目）に入っていてはいけないID */
  ids_forbidden?: string[];
  has_spring_any?: string[];
}
export interface Expected {
  contains_waste: boolean;
  item_count: { min: number; max: number };
  items: ExpectedItem[];
  forbidden_item_names: string[];
  quality_issues_any?: string[];
  retake_advice_required?: boolean;
  confidence_max_all?: Confidence;
  size_basis_forbidden_all?: string[];
}

/** 評価項目（docs/03 の1〜7） */
export type EvalItem = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface Check {
  id: string;
  eval_item: EvalItem;
  passed: boolean;
  detail: string;
}

export interface RulesContext {
  /** 収集品目のID → 品目名 */
  items: Map<string, string>;
  /** 市で収集しない物のID（X で始まる） */
  notCollected: Set<string>;
}

/** 全角・半角や空白の違いで不一致にならないように正規化する */
export const norm = (s: string) => s.normalize("NFKC").replace(/\s+/g, "");

export function loadRules(path: string): RulesContext {
  const text = readFileSync(path, "utf8");
  const items = new Map<string, string>();
  const notCollected = new Set<string>();
  for (const m of text.matchAll(/^\[([A-Z]\d+)\]\s*(.+)$/gm)) {
    if (m[1].startsWith("X")) notCollected.add(m[1]);
    else items.set(m[1], m[2]);
  }
  return { items, notCollected };
}

/** 品目名に「小」「大」の区別があるか */
const hasSize = (name: string) => /(小|大)(\s|（|\(|$)/.test(name);
/** 品目名に「スプリングあり／なし」の区別があるか */
const hasSpringVariant = (name: string) => /スプリング|バネ/.test(name);

const schema = JSON.parse(readFileSync(new URL("../../prompts/response_schema.json", import.meta.url), "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const JA = /[぀-ヿ一-鿿]/;
const FEE = /\d[\d,]*\s*円|処理券/;

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

  const wasteMismatch = r.image_assessment.contains_waste === (r.items.length === 0);
  add("inv.contains_waste", 3, !wasteMismatch, wasteMismatch ? `contains_waste=${r.image_assessment.contains_waste} なのに items が ${r.items.length} 件` : "OK");

  const ids = r.items.map((i) => i.id);
  const expectedIds = r.items.map((_, n) => `item_${n + 1}`);
  add("inv.item_ids", 6, ids.join() === expectedIds.join(), ids.join() === expectedIds.join() ? "OK" : `id が連番でない: ${ids.join(",")}`);

  const highOnPoor = r.image_assessment.overall_quality === "poor" ? r.items.filter((i) => i.confidence === "high").map((i) => i.id) : [];
  add("inv.poor_quality_no_high", 4, highOnPoor.length === 0, highOnPoor.length ? `品質 poor なのに high: ${highOnPoor.join(",")}` : "OK");

  const unknownSize: string[] = [];
  const japanese: string[] = [];
  const shape: string[] = [];
  const grounding: string[] = [];
  const unfounded: string[] = [];
  const fee: string[] = [];

  for (const item of r.items) {
    const se = item.size_estimate;
    if (se.basis === "unknown" && (norm(se.dimensions) !== "不明" || norm(se.weight) !== "不明")) unknownSize.push(`${item.id}: basis=unknown なのに「${se.dimensions}」「${se.weight}」`);
    for (const [field, value] of [["name", item.name], ["description", item.description], ["sodai.reason", item.sodai.reason]] as const) {
      if (!JA.test(value)) japanese.push(`${item.id}.${field}`);
    }

    const s = item.sodai;
    const cand = s.candidates.map((c) => c.list_id);
    switch (s.status) {
      case "listed":
        if (s.list_ids.length !== 1) shape.push(`${item.id}: listed なのに list_ids が ${s.list_ids.length} 件`);
        if (cand.length) shape.push(`${item.id}: listed なのに candidates あり`);
        break;
      case "needs_confirmation":
        if (s.list_ids.length) shape.push(`${item.id}: needs_confirmation なのに list_ids あり`);
        if (cand.length < 2) shape.push(`${item.id}: needs_confirmation なのに候補が ${cand.length} 件`);
        break;
      case "not_collected":
        if (s.list_ids.length === 0) shape.push(`${item.id}: not_collected なのに list_ids が空`);
        if (cand.length) shape.push(`${item.id}: not_collected なのに candidates あり`);
        break;
      default:
        if (s.list_ids.length || cand.length) shape.push(`${item.id}: ${s.status} なのに list_ids / candidates あり`);
    }
    for (const id of [...s.list_ids, ...cand]) {
      if (!rules.items.has(id) && !rules.notCollected.has(id)) grounding.push(`${item.id}: 存在しないID「${id}」`);
      else if (s.status === "not_collected" && !rules.notCollected.has(id)) grounding.push(`${item.id}: not_collected に収集品目のID「${id}」`);
      else if (s.status !== "not_collected" && rules.notCollected.has(id)) grounding.push(`${item.id}: ${s.status} に収集しない物のID「${id}」`);
    }

    // 根拠なく「小／大」「スプリングあり／なし」を決めていないか
    if (s.status === "listed" && s.list_ids.length === 1) {
      const name = rules.items.get(s.list_ids[0]) ?? "";
      if (hasSize(name) && se.basis === "unknown") unfounded.push(`${item.id}: 大きさ不明なのに「${name}」に確定`);
      if (hasSpringVariant(name) && (item.has_spring === "unknown" || item.has_spring === "not_applicable")) unfounded.push(`${item.id}: スプリング不明なのに「${name}」に確定`);
    }

    // 品目名に含まれる「（４枚まで束ねて300円）」のような部分を引用しただけなら問題にしない
    const texts = [s.reason, ...item.cautions.map((c) => c.text), item.description].map((t) => t.replace(/[（(][^）)]*円[^）)]*[）)]/g, ""));
    if (texts.some((t) => FEE.test(t))) fee.push(`${item.id}: 料金・処理券に触れている`);
  }
  if (r.overall_notes && FEE.test(r.overall_notes)) fee.push("overall_notes: 料金・処理券に触れている");

  add("inv.unknown_size", 4, unknownSize.length === 0, problems(unknownSize));
  add("inv.japanese", 6, japanese.length === 0, japanese.length ? `日本語でない項目: ${japanese.join(",")}` : "OK");
  add("inv.status_shape", 7, shape.length === 0, problems(shape));
  add("inv.rule_grounding", 7, grounding.length === 0, problems(grounding));
  add("inv.no_unfounded_variant", 4, unfounded.length === 0, problems(unfounded));
  add("inv.no_fee", 7, fee.length === 0, problems(fee));
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
  if (exp.size_basis_forbidden_all) {
    const bad = r.items.filter((i) => exp.size_basis_forbidden_all!.includes(i.size_estimate.basis)).map((i) => `${i.name}(${i.size_estimate.basis})`);
    add("exp.size_not_asserted", 4, bad.length === 0, bad.length ? `大きさを断定: ${bad.join("、")}` : "OK");
  }

  const used = new Set<Item>();
  for (const e of exp.items) {
    const item = findItem(r.items, e, used);
    add(`exp.item[${e.label}].name`, 1, !!item, item ? `「${item.name}」` : `「${e.name_any.join("|")}」を含む物体名が見つからない`);
    if (!item) continue;
    used.add(item);
    const s = item.sodai;
    const got = [...s.list_ids, ...s.candidates.map((c) => c.list_id)];

    if (e.confidence_min) add(`exp.item[${e.label}].confidence_min`, 1, CONF_RANK[item.confidence] >= CONF_RANK[e.confidence_min], `期待 ${e.confidence_min} 以上 / 実際 ${item.confidence}`);
    if (e.confidence_max) add(`exp.item[${e.label}].confidence_max`, 4, CONF_RANK[item.confidence] <= CONF_RANK[e.confidence_max], `期待 ${e.confidence_max} 以下 / 実際 ${item.confidence}`);
    if (e.status_any) add(`exp.item[${e.label}].status`, 7, e.status_any.includes(s.status), `期待 ${e.status_any.join("|")} / 実際 ${s.status}`);
    if (e.ids_any) {
      const ok = e.ids_any.some((id) => got.includes(id));
      add(`exp.item[${e.label}].ids`, 2, ok, `期待 ${e.ids_any.join("|")} のいずれか / 実際 ${got.join(",") || "（なし）"}`);
    }
    if (e.ids_forbidden) {
      const hit = s.list_ids.filter((id) => e.ids_forbidden!.includes(id));
      add(`exp.item[${e.label}].ids_forbidden`, 7, hit.length === 0, hit.length ? `確定してはいけないID: ${hit.join(",")}` : "OK");
    }
    if (e.has_spring_any) add(`exp.item[${e.label}].has_spring`, 4, e.has_spring_any.includes(item.has_spring), `期待 ${e.has_spring_any.join("|")} / 実際 ${item.has_spring}`);
  }
  return checks;
}
