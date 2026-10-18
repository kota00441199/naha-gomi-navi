# 公式申込の自動入力（独立モジュール）

既存の公式受付自動入力処理を、後から組み込める独立ファイルとして配置しています。
`src`・ルーティング・Vite設定・package.jsonには接続していません。
通常の `npm run dev` / `npm run build` で実行されず、`/auto-input` ページも追加しません。

## ファイル

- `official.mjs`: PlaywrightのPageを受け取り、住所・品目・収集希望日を入力する関数。
- `validation.mjs`: 公式URL、住所、品目、希望日の検証。
- `validation.test.mjs`: 外部アクセスなしで実行できる検証テスト。

## 使用方法

Playwrightを用意したNode.js側から読み込みます。Reactのブラウザー側からは使用できません。
この追加では依存パッケージのインストールやサーバーの起動は行いません。

```js
import { fillProfile, fillItems, selectCalendarDate } from './official.mjs';

// page: 本人が公式メール認証を済ませたPlaywright Page
// それぞれ対応する公式画面を開いてから呼び出す
await fillProfile(page, profile);
await fillItems(page, [{ name: '電子レンジ 大', quantity: 1 }]);
await selectCalendarDate(page, { mode: 'weekdays', weekdays: [1, 4] });
```

`profile` の項目は `name, kana, phone, postal, town, block, number,
building, room, housing, place`。選択肢は `validation.mjs` を参照してください。
品目名は公式画面の名称との完全一致で照合します（空白を除く）。
曜日は日曜=0〜土曜=6。`manual` は手動選択、`earliest` は最短の空き日です。

`runToDate(page, { profile, items, datePolicy })` は住所確認画面から
品目選択・排出日選択まで進める関数です。本人が住所と地図を確認したうえで呼び出してください。
最終申込・決済・メール送信は行いません。入力情報や認証URLのファイル保存も行いません。

## 検証

`jphacks2026` から実行:

```sh
node --test official-auto-input/validation.test.mjs
node --check official-auto-input/official.mjs
```

既存実装を移した試験版です。公式サイトの画面構成に依存し、変更があると停止します。
今回の検証はローカルの入力検証のみで、認証後の公式サイトへの転記は未検証です。
途中で失敗した場合は、すでに入力された内容を公式画面で確認してください。
