# 那覇ごみナビ

写真から6種類の候補を探し、実物の確認後に那覇市の公式ルールを表示する学生チームの試作です。
AIは品目候補だけを返し、分別方法は `lib/rules.ts` の確認済みデータから表示します。

## 担当

- 1・2 かいり＋きふう: `app/page.tsx`, `app/globals.css`, `components/`, `lib/prepare-photo.ts`
- 3 ゆきとら＋ひかる: `app/api/`, `lib/analyze.ts`, `lib/upload.ts`, `lib/quota.ts`, `db/`, `drizzle/`
- 4 こうた＋ひかる: `lib/classify-prompt.ts`, `lib/classification.ts`, `lib/rules.ts`
- 全員: `tests/run.mjs` と実機での確認。AIキーは共有ファイルやGitに入れない。

## 使用技術

TypeScript、React、Vinext、Cloudflare Workers、D1、Gemini API。Python/OpenCVは不要です。
公開先はSites。新規作成時の本人限定公開を維持しています。

## Mac等で動かす

Node.js 22.13.0以上と、このpackage.jsonで指定したpnpmを使います。
まずプロジェクトフォルダーをCursorまたはVS Codeで開き、ターミナルで実行します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

画面に出たローカルURLを開きます。公開サーバーの秘密値やDBは自動ではコピーされません。
キー未設定でも、画面と「品目から調べる」を試せます。ローカル起動は各自のMacで未確認です。

ローカルでAIを使う場合は `.dev.vars` を自分のPCに作り、以下を記入します。実キーは共有しません。

```text
GEMINI_API_KEY="自分のAPIキー"
GEMINI_MODEL="gemini-3.5-flash-lite"
AI_DAILY_LIMIT="20"
```

DBの初回作成は次の順。すでに実行済みのSQLは再実行しないでください。

```sh
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_broad_serpent_society.sql
pnpm dev
```

## 検査

```sh
pnpm exec tsc --noEmit
node tests/run.mjs
pnpm build
```

自動テスト32項目が成功。Gemini通信を置き換え、入力、APIエラー、回答形式、確認条件、SQLiteの回数制限、初期HTMLを確認しています。
2026-10-09 JST、実際の `analyze` 関数とGemini APIで、ボトル写真→pet（8.8秒）、猫写真→unknown（1.6秒）を確認しました。
これは公開画面やスマホで操作した確認ではありません。全6品目の認識精度、カメラ、表示幅の実機確認は残っています。
`node tests/live.mjs 画像パス` は実APIを利用します。課金・利用枠の対象。キーは非表示入力か環境変数で渡します。

## 運用の範囲

- 写真は1枚、JPEG/PNG/WebP。元写真は20MiB・24M画素以下。端末側で長辺1600px以下のJPEGへ縮小した後、送信画像が5MiB以下か確認します。
- サーバーでも容量と形式の先頭情報を確認します。完全な画像デコード検査はしません。
- サイト全体でJSTの日付ごとに最大20回のAI試行。Googleエラー時も試行回数に含みます。
- 60秒でAI通信中断、画面は75秒で待機中断。自動再試行はしません。
- 起動時の接続確認に失敗した場合は「接続を再確認」で再試行できます。
- 判定中もキャンセルや手動の品目選択ができます。キャンセル後の古い回答は表示しません。送信済みのサーバー処理やGoogle側の処理の停止は保証せず、利用回数も戻しません。
- `/api/health` は設定の存在確認のみ。実APIの疎通は写真の送信で確認します。
- 画像、補足、回答をこのアプリのDBへ保存しません。Googleへ送信されます。DBには日付と試行回数だけ保存します。
- 電池、刃物、割れたガラス、スプレー缶、対象外品目は公式案内へ誘導します。
- 写真だけで判別できないPETマーク、紙パックの内側、缶の大きさなどは利用者が確認します。
- 公式ルールは2026-10-09確認。出典は `lib/rules.ts` にあります。情報更新は手動です。
