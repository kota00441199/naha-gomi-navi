// テストケースを Gemini で実行し、採点結果を results/ に保存する検証スクリプト。
// アプリ本体の API 連携ではない（検証専用）。
//
//   npm run check                          … APIを呼ばずに準備状況だけ確認
//   npm run eval                           … 画像がそろっているケースをすべて実行
//   npm run eval -- --case TC01,TC05       … 指定ケースだけ
//   npm run eval -- --repeat 3             … 各ケースを3回（ばらつき確認）
//   npm run eval -- --prompt baseline      … 改善前（v0）のプロンプトで比較
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import { checkExpected, checkInvariants, checkSchema, loadRules, type Check, type Expected } from "./scorer.js";

const EVAL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_DIR = resolve(EVAL_DIR, "../prompts");
const PROMPT_VERSION = "v1.0";

interface RuleSet { file: string; municipality: string; source: string }
interface TestCase {
  id: string; title: string; group: string; image: string; how_to_shoot: string;
  rules: string; user_note: string; eval_items: number[]; expected: Expected; manual_checks: string[];
}
interface CaseResult {
  id: string; title: string; run: number;
  status: "executed" | "skipped" | "error";
  reason?: string; image?: string; latency_ms?: number;
  usage?: unknown; checks?: Check[]; manual_checks: string[]; raw_file?: string;
}

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const dryRun = args.includes("--dry-run");
const promptKind = flag("prompt") ?? "v1";
const repeat = Number(flag("repeat") ?? 1);
const only = flag("case")?.split(",");
const model = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
const temperature = process.env.GEMINI_TEMPERATURE ? Number(process.env.GEMINI_TEMPERATURE) : undefined;
const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

const suite = JSON.parse(readFileSync(join(EVAL_DIR, "test-cases.json"), "utf8")) as { rule_sets: Record<string, RuleSet | null>; cases: TestCase[] };
const cases = suite.cases.filter((c) => !only || only.includes(c.id));
const schema = JSON.parse(readFileSync(join(PROMPT_DIR, "response_schema.json"), "utf8"));
const systemInstruction = readFileSync(join(PROMPT_DIR, promptKind === "baseline" ? "baseline_v0.txt" : "system_instruction.txt"), "utf8");
const userTemplate = readFileSync(join(PROMPT_DIR, "user_prompt_template.txt"), "utf8");

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".heic": "image/heic" };
function findImage(stem: string): string | undefined {
  for (const ext of Object.keys(MIME)) for (const e of [ext, ext.toUpperCase()]) {
    const p = join(EVAL_DIR, "images", stem + e);
    if (existsSync(p)) return p;
  }
}

function rulesPath(key: string): string | null {
  const rs = suite.rule_sets[key];
  if (rs === undefined) throw new Error(`未定義のルールセット: ${key}`);
  return rs ? join(EVAL_DIR, rs.file) : null;
}

function renderUserPrompt(tc: TestCase): string {
  const rs = suite.rule_sets[tc.rules];
  const rulesText = rs ? readFileSync(join(EVAL_DIR, rs.file), "utf8").trim() : "提供なし";
  return userTemplate
    .replace("{{MUNICIPALITY_NAME}}", rs?.municipality ?? "未指定")
    .replace("{{RULES_SOURCE}}", rs?.source ?? "なし")
    .replace("{{MUNICIPALITY_RULES}}", rulesText)
    .replace("{{USER_NOTE}}", tc.user_note || "（なし）");
}

// ---------- 準備状況の確認 ----------
const withImage = cases.filter((c) => findImage(c.image));
console.log(`プロンプト: ${promptKind === "baseline" ? "baseline (v0)" : PROMPT_VERSION} / モデル: ${model}`);
console.log(`テストケース: ${cases.length} 件（画像あり ${withImage.length} 件 / 画像なし ${cases.length - withImage.length} 件）`);
for (const key of Object.keys(suite.rule_sets)) {
  const p = rulesPath(key);
  if (p) { const r = loadRules(p); console.log(`ルール ${key}: ID ${r.ruleIds.size} 件・区分 ${r.categories.size} 種（${[...r.categories].join("、")}）`); }
}
console.log(`APIキー: ${apiKey ? "設定済み" : "未設定（GEMINI_API_KEY）"}`);

if (dryRun) {
  const missing = cases.filter((c) => !findImage(c.image)).map((c) => `${c.image}（${c.id}）`);
  if (missing.length) console.log(`\n未配置の画像: ${[...new Set(missing)].join(", ")}\n→ eval/images/ に <名前>.jpg などで置いてください`);
  console.log("\n--dry-run のため Gemini は呼び出していません。");
  process.exit(0);
}
if (!apiKey) {
  console.error("\nGEMINI_API_KEY が未設定のため実行できません。テストは「未実施」です。");
  process.exit(1);
}
if (withImage.length === 0) {
  console.error("\n画像が1枚もないため実行できません。テストは「未実施」です。");
  process.exit(1);
}

// ---------- 実行 ----------
const ai = new GoogleGenAI({ apiKey });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = join(EVAL_DIR, "results", `${stamp}_${promptKind}_${model}`);
mkdirSync(join(outDir, "raw"), { recursive: true });

async function callGemini(imagePath: string, userPrompt: string) {
  const data = readFileSync(imagePath).toString("base64");
  const mimeType = MIME[extname(imagePath).toLowerCase()];
  return ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ inlineData: { mimeType, data } }, { text: userPrompt }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      // baseline は「形式を指示しなかった場合」を比べるためスキーマを渡さない
      ...(promptKind === "baseline" ? {} : { responseJsonSchema: schema }),
      ...(temperature !== undefined ? { temperature } : {}),
    },
  });
}

const results: CaseResult[] = [];
for (const tc of cases) {
  for (let run = 1; run <= repeat; run++) {
    const base = { id: tc.id, title: tc.title, run, manual_checks: tc.manual_checks };
    const img = findImage(tc.image);
    if (!img) { results.push({ ...base, status: "skipped", reason: `画像 ${tc.image} が未配置` }); continue; }
    const t0 = Date.now();
    try {
      // 混雑（503）や上限（429）などの一時的なエラーは、待ち時間を延ばしながら再試行する
      const waits = [5000, 15000, 30000];
      let res;
      for (let attempt = 0; ; attempt++) {
        try { res = await callGemini(img, renderUserPrompt(tc)); break; }
        catch (e) {
          const transient = /\b(429|500|503)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/i.test((e as Error).message);
          if (!transient || attempt >= waits.length) throw e;
          console.log(`${tc.id} run${run}: 一時的なエラーのため ${waits[attempt] / 1000} 秒後に再試行（${attempt + 1}/${waits.length}）`);
          await new Promise((r) => setTimeout(r, waits[attempt]));
        }
      }
      const raw = res.text ?? "";
      const rawFile = join("raw", `${tc.id}_run${run}.json`);
      writeFileSync(join(outDir, rawFile), raw);
      const { checks, parsed } = checkSchema(raw);
      if (parsed) checks.push(...checkInvariants(parsed, loadRules(rulesPath(tc.rules))), ...checkExpected(parsed, tc.expected));
      results.push({ ...base, status: "executed", image: img, latency_ms: Date.now() - t0, usage: res.usageMetadata, checks, raw_file: rawFile });
      const failed = checks.filter((c) => !c.passed).length;
      console.log(`${tc.id} run${run}: 自動チェック ${checks.length - failed}/${checks.length} 合格`);
    } catch (e) {
      results.push({ ...base, status: "error", reason: (e as Error).message });
      console.log(`${tc.id} run${run}: エラー ${(e as Error).message}`);
    }
  }
}

// ---------- レポート ----------
const executed = results.filter((r) => r.status === "executed");
const byItem = new Map<number, { pass: number; total: number }>();
for (const c of executed.flatMap((r) => r.checks ?? [])) {
  const s = byItem.get(c.eval_item) ?? { pass: 0, total: 0 };
  s.total++; if (c.passed) s.pass++;
  byItem.set(c.eval_item, s);
}
const EVAL_NAMES: Record<number, string> = {
  0: "整合性", 1: "物体名の認識", 2: "材質の判断", 3: "写っていない物を答えない", 4: "不明な情報を断定しない",
  5: "複数のゴミの認識", 6: "JSON形式", 7: "自治体ルールとの一致",
};
const lines = [
  `# 検証結果 ${stamp}`, "",
  `- プロンプト: ${promptKind === "baseline" ? "baseline (v0)" : PROMPT_VERSION}`,
  `- モデル: ${model}${temperature !== undefined ? ` / temperature=${temperature}` : ""}`,
  `- 実行: ${executed.length} 件 / スキップ: ${results.filter((r) => r.status === "skipped").length} 件 / エラー: ${results.filter((r) => r.status === "error").length} 件`,
  "", "## 評価項目別（自動チェック）", "", "| 評価項目 | 合格 / 件数 |", "|---|---|",
  ...[...byItem.entries()].sort(([a], [b]) => a - b).map(([k, v]) => `| ${k}. ${EVAL_NAMES[k]} | ${v.pass} / ${v.total} |`),
  "", "## ケース別", "",
];
for (const r of results) {
  lines.push(`### ${r.id} run${r.run} ${r.title}`, "");
  if (r.status !== "executed") { lines.push(`**${r.status === "skipped" ? "スキップ" : "エラー"}**: ${r.reason}`, ""); continue; }
  lines.push(`生の回答: \`${r.raw_file}\` / 応答時間 ${r.latency_ms} ms`, "", "| 結果 | チェック | 内容 |", "|---|---|---|");
  for (const c of r.checks ?? []) lines.push(`| ${c.passed ? "✅" : "❌"} | ${c.id} | ${c.detail.replace(/\|/g, "\\|")} |`);
  lines.push("", "目視チェック（担当者が記入）:", ...r.manual_checks.map((m) => `- [ ] ${m}`), "");
}
writeFileSync(join(outDir, "summary.json"), JSON.stringify({ stamp, prompt: promptKind, model, temperature, results }, null, 2));
writeFileSync(join(outDir, "report.md"), lines.join("\n"));
console.log(`\nレポート: ${join(outDir, "report.md")}`);
