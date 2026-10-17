// data/ の公式データから、Gemini に渡す品目リスト（prompts/rules_naha_sodai.txt）を作る。
// 料金は Gemini に渡さない（料金はアプリが data/ から表示するため）。
//
//   npm run rules
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p: string) => JSON.parse(readFileSync(resolve(ROOT, p), "utf8"));
const items = read("data/naha-sodai-items.json");
const info = read("data/naha-sodai-info.json");

const lines = [
  "那覇市 そ大ごみ 収集品目リスト",
  `出典：${items.source.title}（${items.source.url}、取得日 ${items.source.retrieved}）`,
  `　　　${info.sources[0].title}（${info.sources[0].url}、更新日 ${info.sources[0].page_updated}）`,
  "",
  "■ 判定の基準",
  `- 品目名の「小」：${info.size_rule.small.split("（")[0]}`,
  `- 品目名の「大」：${info.size_rule.large.split("（")[0]}`,
  `- ${info.always_sodai_note}`,
  `- ${info.not_in_list_note}`,
  "",
  "■ 収集品目（[ID] 分類｜品目名）",
  ...items.items.map((i: { id: string; category: string; name: string }) => `[${i.id}] ${i.category}｜${i.name}`),
  "",
  "■ 市で収集しない物（[ID] 区分：例）",
  ...info.not_collected.map((x: { id: string; label: string; examples: string[] }) => `[${x.id}] ${x.label}${x.examples.length ? `：${x.examples.join("、")}` : ""}`),
  "",
];
writeFileSync(resolve(ROOT, "prompts/rules_naha_sodai.txt"), lines.join("\n"));
console.log(`prompts/rules_naha_sodai.txt を生成しました（収集品目 ${items.items.length} 件・収集しない物 ${info.not_collected.length} 件）`);
