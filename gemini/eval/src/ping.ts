// Gemini API の接続確認。画像は使わず、テキストだけで1回呼び出す。
// 確かめること：APIキーが有効か／モデルが使えるか／response_schema.json を API が受け付けるか。
//
//   npm run ping
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import { checkSchema } from "./scorer.js";

const PROMPT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../prompts");
const model = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY が未設定です。export してから実行してください。");
  process.exit(1);
}

const schema = JSON.parse(readFileSync(join(PROMPT_DIR, "response_schema.json"), "utf8"));
const systemInstruction = readFileSync(join(PROMPT_DIR, "system_instruction.txt"), "utf8");
const ai = new GoogleGenAI({ apiKey });

console.log(`モデル: ${model}`);
const t0 = Date.now();
try {
  const res = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: "接続確認です。画像は添付していません。ゴミが写っていない場合として、指定のJSON形式で出力してください。\n\n<municipality_rules municipality=\"未指定\" source=\"なし\">\n提供なし\n</municipality_rules>\n\n<user_note>\n（なし）\n</user_note>" }] }],
    config: { systemInstruction, responseMimeType: "application/json", responseJsonSchema: schema },
  });
  console.log(`✅ APIキー：有効`);
  console.log(`✅ モデル：${model} を利用可能（応答 ${Date.now() - t0} ms）`);
  console.log(`✅ response_schema.json：API が受け付けた`);
  const { checks } = checkSchema(res.text ?? "");
  const c = checks[0];
  console.log(`${c.passed ? "✅" : "❌"} 返ってきたJSON：${c.detail}`);
  process.exit(c.passed ? 0 : 1);
} catch (e) {
  const msg = (e as Error).message;
  console.error(`❌ 呼び出しに失敗しました（${Date.now() - t0} ms）`);
  if (/API key|API_KEY_INVALID|PERMISSION_DENIED|401|403/i.test(msg)) console.error("→ APIキーが無効か、権限がありません。AI Studio でキーを確認してください。");
  else if (/not found|404/i.test(msg)) console.error(`→ モデル ${model} が使えません。GEMINI_MODEL で別のモデルを指定してください。`);
  else if (/schema|400|INVALID_ARGUMENT/i.test(msg)) console.error("→ response_schema.json を API が受け付けなかった可能性があります（docs/04 の未確認リスク）。");
  else if (/429|quota|RESOURCE_EXHAUSTED/i.test(msg)) console.error("→ 利用上限に達しています。時間をおいて再実行してください。");
  console.error(`詳細: ${msg}`);
  process.exit(1);
}
