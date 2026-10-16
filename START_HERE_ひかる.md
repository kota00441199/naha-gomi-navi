# Cursorで始める：ひかる用

このフォルダーには、資料と同じ構成の完成コードが入っています。
Pythonは使いません。TypeScriptで書かれています。

## 1. Cursorで開く
ZIPを展開し、Cursorの「Open Folder」で naha-gomi-navi を開いてください。
または、Cursorから naha-gomi-navi.code-workspace を開いてください。

## 2. 画面を動かす
Node.js 22.13.0以上が必要です。
Cursorの「Terminal → New Terminal」で、以下を1行ずつ実行します。

```sh
node --version
npm --version
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

ターミナルに出たURLをブラウザーで開きます。通常は http://localhost:5173 です。
最初は「品目から調べる」を使ってください。APIキーなしで試せます。
停止はターミナルで Control+C です。

## 3. ひかるが開くコード
1. lib/analyze.ts：写真をGeminiへ送り、回答を受け取る中心の処理。
2. lib/classification.ts：AIの回答が正しい形式か確認する処理。
3. lib/classify-prompt.ts：こうたと調整するAIへの指示。
4. lib/rules.ts：確認条件と分別ルール。

最初は analyze.ts の fetch を探し、「何を送るか」「何が返るか」を読みます。
完成コードを消して書き直す必要はありません。読んでから1か所ずつ変更します。

## 4. 写真をAI判定する
公開サイトのAPIキーは入っていません。自分のキーとローカルDBの設定が必要です。
README.md の「ローカルでAIを使う場合」と「DBの初回作成」に沿って準備してください。
キーは .dev.vars にだけ書き、チャット・Git・チーム配布ZIPへ入れないでください。
モデル名は自分のAPIキーで利用できるものを指定します。

## 5. 変更後の確認
```sh
pnpm exec tsc --noEmit
node tests/run.mjs
pnpm build
```

今回の引き渡しでは32項目の自動テストを再実行しています。
Googleへの通信はテスト用の応答に置き換えています。
あなたのMac・スマホと、あなたのAPIキーを使った実通信は未確認です。
詳しい機能・制限・DB設定は README.md を参照してください。
