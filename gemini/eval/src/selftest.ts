// 採点ロジック（scorer.ts）の自己テスト。Gemini は呼び出さない。
// samples/ の手書きの回答例（Gemini の出力ではない）を採点し、
// 「正しい回答は合格」「誤った回答は狙ったチェックで不合格」になるかを確かめる。
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkExpected, checkInvariants, checkSchema, loadRules, type Check } from "./scorer.js";

const EVAL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const suite = JSON.parse(readFileSync(join(EVAL_DIR, "test-cases.json"), "utf8"));

interface Scenario { sample: string; caseId: string; mustFail: string[] }
const scenarios: Scenario[] = [
  { sample: "example_TC01_naha.json", caseId: "TC01", mustFail: [] },
  { sample: "bad_TC07_spring_asserted.json", caseId: "TC07", mustFail: ["inv.no_unfounded_variant", "exp.item[ソファー].status"] },
  { sample: "bad_TC10_knowledge_leak.json", caseId: "TC10", mustFail: ["inv.rule_grounding", "inv.no_fee", "exp.item[テレビ].status", "exp.item[テレビ].ids"] },
  { sample: "bad_TC15_dark_overconfident.json", caseId: "TC15", mustFail: ["inv.poor_quality_no_high", "inv.unknown_size", "exp.retake_advice", "exp.confidence_max_all", "exp.no_hallucinated_items"] },
  { sample: "bad_TC18_wrong_list.json", caseId: "TC18", mustFail: ["inv.rule_grounding", "exp.item[椅子].ids", "exp.item[椅子].ids_forbidden"] },
];

let failures = 0;
for (const s of scenarios) {
  const tc = suite.cases.find((c: { id: string }) => c.id === s.caseId);
  const rs = suite.rule_sets[tc.rules];
  const raw = readFileSync(join(EVAL_DIR, "samples", s.sample), "utf8");
  const { checks, parsed } = checkSchema(raw);
  if (parsed) checks.push(...checkInvariants(parsed, loadRules(join(EVAL_DIR, rs.file))), ...checkExpected(parsed, tc.expected));
  const failed = new Set(checks.filter((c: Check) => !c.passed).map((c) => c.id));
  const missed = s.mustFail.filter((id) => !failed.has(id));
  const unexpected = [...failed].filter((id) => !s.mustFail.includes(id));
  const ok = missed.length === 0 && unexpected.length === 0;
  if (!ok) failures++;
  console.log(`${ok ? "OK  " : "NG  "} ${s.sample} (${s.caseId}) 不合格になったチェック: ${[...failed].join(", ") || "なし"}`);
  if (missed.length) console.log(`     検出できなかった: ${missed.join(", ")}`);
  if (unexpected.length) {
    console.log(`     想定外の不合格: ${unexpected.join(", ")}`);
    for (const c of checks.filter((c) => unexpected.includes(c.id))) console.log(`       - ${c.id}: ${c.detail}`);
  }
}
console.log(failures ? `\n自己テスト失敗: ${failures} 件` : "\n自己テスト: すべて想定どおり");
process.exit(failures ? 1 : 0);
