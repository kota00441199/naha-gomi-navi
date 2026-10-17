export type WasteItem = {
  id: number;
  name: string;
  category: string;
  fee: number;
  ticketCount: number | null;
};

export const categories = ["すべて", "家事日用品", "家具・寝具", "家電製品", "趣味・園芸・工具用品", "その他のもの","収納庫・室外用品","自転車類","スポーツ・レジャー・遊具","健康器具","楽器・オーディオ製品","敷物・室内用品","ＯＡ機器","乳幼児製品"];

export const wasteItems: WasteItem[] = [
  {
    "id": 1,
    "name": "アイロン台",
    "category": "家事日用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 2,
    "name": "アコーディオンカーテン （レール付）小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 3,
    "name": "アコーディオンカーテン （レール付）大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 4,
    "name": "雨戸　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 5,
    "name": "雨戸　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 6,
    "name": "編み機",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 7,
    "name": "網戸 （４枚まで束ねて300円)",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 8,
    "name": "アルミサッシ",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 9,
    "name": "アンテナ （テレビ用）",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 10,
    "name": "衣装箱 （ケース）(３つまで重ねて300円)",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 11,
    "name": "椅子 （スプリングなし）　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 12,
    "name": "椅子 （スプリングなし）　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 13,
    "name": "板きれ　小 （1ｍ以下に切断し、ひもで束ねる）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 14,
    "name": "板きれ　大 （１ｍ以下に切断し、ひもで束ねる）",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 15,
    "name": "一輪車　小",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 16,
    "name": "一輪車　大",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 17,
    "name": "ウインドサーフィン （購入時セット）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 18,
    "name": "植木鉢 （中身は抜く）　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 19,
    "name": "植木鉢 （中身は抜く）　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 20,
    "name": "エアロバイク （自転車型の運動器具）",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 21,
    "name": "枝きりばさみ　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 22,
    "name": "枝きりばさみ　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 23,
    "name": "エレクトーン",
    "category": "楽器・オーディオ製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 24,
    "name": "園芸用支柱　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 25,
    "name": "オーディオ製品　小",
    "category": "楽器・オーディオ製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 26,
    "name": "オーディオ製品　大",
    "category": "楽器・オーディオ製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 27,
    "name": "オーディオラック　小",
    "category": "楽器・オーディオ製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 28,
    "name": "オーディオラック　大",
    "category": "楽器・オーディオ製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 29,
    "name": "オーブントースター 小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 30,
    "name": "オーブントースター　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 31,
    "name": "オーブンレンジ　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 32,
    "name": "オーブンレンジ　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 33,
    "name": "斧 （おの）（指定ごみ袋に入ってもそ大ごみ）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 34,
    "name": "おもちゃの電動車 （充電池外せないもの）",
    "category": "乳幼児製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 35,
    "name": "折畳みソファーベッド （スプリング無し）小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 36,
    "name": "折畳みソファーベッド （スプリング無し）大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 37,
    "name": "折り畳みベッド　小 （スプリングなし）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 38,
    "name": "折り畳みベッド　大 （スプリングなし）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 39,
    "name": "折り畳みベッド （Ｓ字バネあり）",
    "category": "家具・寝具",
    "fee": 1940,
    "ticketCount": 1
  },
  {
    "id": 40,
    "name": "オルガン",
    "category": "楽器・オーディオ製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 41,
    "name": "温熱器 （ドーム型）",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 42,
    "name": "カーテンレール　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 43,
    "name": "カーテンレール　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 44,
    "name": "カーペット　小",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 45,
    "name": "カーペット　大",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 46,
    "name": "鏡　大 （鏡台は購入時一式（専用椅子を含む））",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 47,
    "name": "鏡　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 48,
    "name": "角材・板　小 （１ｍ以下に切断し、ひもで束ねる）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 49,
    "name": "角材・板　大 （１ｍ以下に切断し、ひもで束ねる）",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 50,
    "name": "学習机セット （取付け本棚・取付け照明・ワゴン引出しを含んで600円）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 51,
    "name": "かさ立て",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 52,
    "name": "ガスコンロ （電池は外す）",
    "category": "家事日用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 53,
    "name": "ガス湯沸かし器",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 54,
    "name": "カセットコンロ （カセットボンベは取外、中身を使い切り資源化物へ）",
    "category": "家事日用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 55,
    "name": "門松　小",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 56,
    "name": "門松　大",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 57,
    "name": "金網　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 58,
    "name": "金網　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 59,
    "name": "カラーボックス　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 60,
    "name": "カラーボックス　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 61,
    "name": "キーボード （楽器）",
    "category": "楽器・オーディオ製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 62,
    "name": "ギター （専用ケースに入れても一点）",
    "category": "楽器・オーディオ製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 63,
    "name": "キックボード",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 64,
    "name": "脚立",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 65,
    "name": "キャットタワー　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 66,
    "name": "キャットタワー　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 67,
    "name": "キャビネット　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 68,
    "name": "キャビネット　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 69,
    "name": "キャリーバック （中身は出す）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 70,
    "name": "くい （鉄製・テント用等）（指定ごみ袋に入ってもそ大ごみ）",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 71,
    "name": "空気清浄機　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 72,
    "name": "空気清浄機　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 73,
    "name": "クーラーボックス　小",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 74,
    "name": "クーラーボックス　大",
    "category": "スポーツ・レジャー・遊具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 75,
    "name": "鎖・チェーン （金属製）　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 76,
    "name": "鎖・チェーン （金属製）　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 77,
    "name": "くつ箱　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 78,
    "name": "くつ箱　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 79,
    "name": "車いす （電動車いす）",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 80,
    "name": "車いす　小",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 81,
    "name": "車いす　大",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 82,
    "name": "クローゼット　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 83,
    "name": "クローゼット　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 84,
    "name": "剣道の防具 （面、胴、小手をしっかりまとめて一式１点）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 85,
    "name": "高圧洗浄機　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 86,
    "name": "高圧洗浄機　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 87,
    "name": "工具類 （複数の工具を、工具箱に入れ、又はひもで束ねて1点）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 88,
    "name": "ござ・むしろ",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 89,
    "name": "こたつ （天板含む）　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 90,
    "name": "こたつ （天板含む）　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 91,
    "name": "琴・大正琴 （専用ケースに入れても一点）",
    "category": "楽器・オーディオ製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 92,
    "name": "コピー機 （２名で運べる重量、家庭用として使用していた場合に限る）",
    "category": "ＯＡ機器",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 93,
    "name": "ごみ箱　小",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 94,
    "name": "ゴルフセット小 （ゴルフバックの中にゴルフクラブを入れた状態）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 95,
    "name": "ゴルフセット大 （ゴルフバックの中にゴルフクラブを入れた状態）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 96,
    "name": "ゴルフバッグ",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 97,
    "name": "サーフボード",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 98,
    "name": "座椅子　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 99,
    "name": "座椅子　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 100,
    "name": "サイドボード　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 101,
    "name": "サイドボード　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 102,
    "name": "サウナ （家庭用）",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 103,
    "name": "サマーベッド",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 104,
    "name": "サンドバッグ （砂入り）",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 105,
    "name": "三輪車",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 106,
    "name": "シーサー （獅子）（左右で一対をまとめて1点）",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 107,
    "name": "磁気マット",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 108,
    "name": "自転車　小",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 109,
    "name": "自転車　大",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 110,
    "name": "電動自転車 （バッテリーは外しリサイクル協力店へ）",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 111,
    "name": "自動車のウイング",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 112,
    "name": "自動車のバンパー",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 113,
    "name": "自動車のホイール　小 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 114,
    "name": "自動車のホイール　大 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 115,
    "name": "自動車のエアロパーツ",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 116,
    "name": "ジャッキ （車に装備しているもの、指定ごみ袋に入ってもそ大ごみ）",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 117,
    "name": "じゅうたん　小",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 118,
    "name": "じゅうたん　大",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 119,
    "name": "収納ケース （引き出しのあるもの）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 120,
    "name": "収納タンス　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 121,
    "name": "収納タンス　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 122,
    "name": "焼却炉 （家庭用）　小（ステンレス製で枯葉等をもやす筒状のもの）",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 123,
    "name": "焼却炉 （家庭用）　大（ステンレス製で枯葉等をもやす筒状のもの）",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 124,
    "name": "障子 （１枚）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 125,
    "name": "照明器具 （電球・蛍光灯は外す）小　※ＰＣＢ使用品は不可",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 126,
    "name": "照明器具 （電球・蛍光灯は外す）大　※ＰＣＢ使用品は不可",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 127,
    "name": "除湿機　小 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 128,
    "name": "除湿機　大 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 129,
    "name": "食器洗浄機・食器乾燥機　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 130,
    "name": "食器洗浄機・食器乾燥機　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 131,
    "name": "食器棚　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 132,
    "name": "食器棚　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 133,
    "name": "シンメー鍋　小",
    "category": "家事日用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 134,
    "name": "シンメー鍋　大",
    "category": "家事日用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 135,
    "name": "水槽　小 （割れたものは有害・危険ごみ）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 136,
    "name": "水槽　大 （割れたものは有害・危険ごみ）",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 137,
    "name": "水槽　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 138,
    "name": "水槽　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 139,
    "name": "水道栓 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 140,
    "name": "スーツケース （布製・プラスチック製）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 141,
    "name": "鋤 （すき）（1ｍを超えるもの）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 142,
    "name": "スキー用品",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 143,
    "name": "スケートボード",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 144,
    "name": "スコップ （１ｍを超えるもの）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 145,
    "name": "すだれ （３つまで重ねて300円）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 146,
    "name": "ステレオ　小",
    "category": "楽器・オーディオ製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 147,
    "name": "ステレオ　大",
    "category": "楽器・オーディオ製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 148,
    "name": "すのこ （４枚まで束ねて300円）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 149,
    "name": "スパナ （大型の工具、長さが30cmを超える場合）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 150,
    "name": "石油ストーブ （燃料は残さない、指定ごみ袋に入ってもそ大ごみ）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 151,
    "name": "扇風機　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 152,
    "name": "扇風機　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 153,
    "name": "洗面台・洗面化粧台",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 154,
    "name": "掃除機　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 155,
    "name": "ソーラー温水器",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 156,
    "name": "ソーラーパネル　小",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 157,
    "name": "ソーラーパネル　大",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 158,
    "name": "その他の家事日用品　小",
    "category": "家事日用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 159,
    "name": "その他の家事日用品　大",
    "category": "家事日用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 160,
    "name": "その他の健康器具　小",
    "category": "健康器具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 161,
    "name": "その他の健康器具　大",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 162,
    "name": "その他の楽器・オーディオ製品　小",
    "category": "楽器・オーディオ製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 163,
    "name": "その他の楽器・オーディオ製品　大",
    "category": "楽器・オーディオ製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 164,
    "name": "その他のスポーツ・レジャー・遊具　小",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 165,
    "name": "その他のスポーツ・レジャー・遊具　大",
    "category": "スポーツ・レジャー・遊具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 166,
    "name": "その他の乳幼児用製品　小",
    "category": "乳幼児製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 167,
    "name": "その他の乳幼児用製品　大",
    "category": "乳幼児製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 168,
    "name": "ソファー （スプリングあり・１人掛け）",
    "category": "家具・寝具",
    "fee": 1270,
    "ticketCount": 1
  },
  {
    "id": 169,
    "name": "ソファー （スプリングあり・２人掛け以上）",
    "category": "家具・寝具",
    "fee": 1940,
    "ticketCount": 1
  },
  {
    "id": 170,
    "name": "ソファー （スプリングなし）　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 171,
    "name": "ソファー （スプリングなし）　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 172,
    "name": "台車　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 173,
    "name": "台車　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 174,
    "name": "タイヤのホイールリム （自動車・バイク）（タイヤ（ゴムの部分）は外す）",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 175,
    "name": "竹馬 （金属製、1ｍを超えるもの）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 176,
    "name": "竹馬 （木製・竹製、1ｍを超えるもの）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 177,
    "name": "畳 （一畳）",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 178,
    "name": "畳 （半畳）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 179,
    "name": "畳 （ユニット式の薄型軽量のシステム畳）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 180,
    "name": "棚　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 181,
    "name": "棚　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 182,
    "name": "たらい （金属製）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 183,
    "name": "たらい （プラスチック製）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 184,
    "name": "タンス　小 （ばらしても上下一式で1点）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 185,
    "name": "タンス　大 （ばらしても上下一式で1点）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 186,
    "name": "ダンベル （金属製）小　（そ大ごみ、２個をひもで束ねて１点扱い）",
    "category": "健康器具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 187,
    "name": "ダンベル （金属製）大　（そ大ごみ、２個をひもで束ねて２点扱い）",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 188,
    "name": "チャイルドシート　小",
    "category": "乳幼児製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 189,
    "name": "チャイルドシート　大",
    "category": "乳幼児製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 190,
    "name": "ついたて （パーテーション）小",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 191,
    "name": "ついたて （パーテーション）大",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 192,
    "name": "机　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 193,
    "name": "机　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 194,
    "name": "つっぱり棒　小",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 195,
    "name": "つるはし （１ｍを超えるもの）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 196,
    "name": "テーブル　小 （椅子は別）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 197,
    "name": "テーブル　大 （椅子は別）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 198,
    "name": "鉄筋　小 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 199,
    "name": "鉄筋　大 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 200,
    "name": "鉄パイプ　小 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 201,
    "name": "鉄パイプ　大 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 202,
    "name": "鉄板　小 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 203,
    "name": "鉄板　大 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 204,
    "name": "テレビ台　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 205,
    "name": "テレビ台　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 206,
    "name": "電気カーペット　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 207,
    "name": "電気カーペット　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 208,
    "name": "電子ピアノ",
    "category": "楽器・オーディオ製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 209,
    "name": "電子レンジ　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 210,
    "name": "電子レンジ　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 211,
    "name": "テント本体一式　小 （付属　椅子・テーブル等除く）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 212,
    "name": "テント本体一式　大 （付属　椅子・テーブル等除く）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 213,
    "name": "電動いとのこ （電池は外す）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 214,
    "name": "電動かんな （電池は外す）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 215,
    "name": "電動ドリル （電池は外す）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 216,
    "name": "電動のこぎり （電池は外す）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 217,
    "name": "ドア　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 218,
    "name": "ドア　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 219,
    "name": "トタン （金属製）（束ねずに１つ300円）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 220,
    "name": "トタン （ビニール製）（４枚まで束ねて300円）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 221,
    "name": "ドラム缶",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 222,
    "name": "トランポリン",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 223,
    "name": "鳥かご",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 224,
    "name": "トレース （製図用）　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 225,
    "name": "トレース （製図用）　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 226,
    "name": "トレーニング機器　小",
    "category": "健康器具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 227,
    "name": "トレーニング機器　大",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 228,
    "name": "流し台 （ステンレス）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 229,
    "name": "生ごみ処理機 （電気式）　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 230,
    "name": "生ごみ処理機 （電気式）　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 231,
    "name": "生ごみ処理機 （プラスチック製）　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 232,
    "name": "生ごみ処理機 （プラスチック製）　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 233,
    "name": "二段ベッド （上下）（バラしても上下で１点）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 234,
    "name": "バーベキューセット　小",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 235,
    "name": "バーベキューセット　大",
    "category": "スポーツ・レジャー・遊具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 236,
    "name": "パイプベッド",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 237,
    "name": "はしご　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 238,
    "name": "はしご　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 239,
    "name": "バスタブ・浴槽　大",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 240,
    "name": "バスタブ・浴槽　小",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 241,
    "name": "発電機 （家庭用）（燃料を抜く）",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 242,
    "name": "ハンガーラック",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 243,
    "name": "ハンマー （釘を打つ面の直径が３cm未満の場合はもやさないごみ）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 244,
    "name": "ヒーター （電気）",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 245,
    "name": "ビーチチェア・シャワーチェア",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 246,
    "name": "ビーチパラソル",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 247,
    "name": "ひな祭りセット　小 （一式（ひな壇・人形・飾り）まとめて一枚）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 248,
    "name": "ひな祭りセット　大 （一式（ひな壇・人形・飾り）まとめて一枚）",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 249,
    "name": "火鉢",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 250,
    "name": "ファックス　大 （２名で運べる重量、家庭用として使用していた場合に限る）",
    "category": "ＯＡ機器",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 251,
    "name": "ファックス　小 （家庭用として使用していた場合に限る）",
    "category": "ＯＡ機器",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 252,
    "name": "ふすま （１枚で１点）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 253,
    "name": "仏壇　小 （ばらしても上下一式で１点）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 254,
    "name": "仏壇　大 （ばらしても上下一式で１点）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 255,
    "name": "布団 （掛け・敷き布団それぞれ１点扱い）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 256,
    "name": "布団一式 （掛け布団・敷き布団の一式で１点）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 257,
    "name": "ブラインドカーテン　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 258,
    "name": "ブラインドカーテン　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 259,
    "name": "ぶら下がり健康器",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 260,
    "name": "プランター　小 （中身を出す、３個まで重ねて300円）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 261,
    "name": "プランター　大 （中身を出す、10㎏を超えるもの）",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 262,
    "name": "プリンター　小",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 263,
    "name": "プリンター　大",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 264,
    "name": "風呂桶　小",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 265,
    "name": "風呂桶　大",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 266,
    "name": "ベッド （スプリング入りマット・一体型（マットレスと枠が切り離し不可））",
    "category": "家具・寝具",
    "fee": 2600,
    "ticketCount": 1
  },
  {
    "id": 267,
    "name": "ペットの小屋　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 268,
    "name": "ペットの小屋　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 269,
    "name": "ベッド枠　小 （フレームのみ・枠のみ）",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 270,
    "name": "ベッド枠　大 （フレームのみ・枠のみ）",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 271,
    "name": "ベニヤ板　小 （１ｍ以下に切断し、ひもで束ねる）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 272,
    "name": "ベニヤ板　大 （１ｍ以下に切断し、ひもで束ねる）",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 273,
    "name": "ベビーカー",
    "category": "乳幼児製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 274,
    "name": "ベビーバス",
    "category": "乳幼児製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 275,
    "name": "ベビーベッド （スプリングなし）大",
    "category": "乳幼児製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 276,
    "name": "ベビーベッド （スプリング入り）",
    "category": "乳幼児製品",
    "fee": 2600,
    "ticketCount": 1
  },
  {
    "id": 277,
    "name": "ベビーベッド （スプリングなし）小",
    "category": "乳幼児製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 278,
    "name": "便器 （陶器）（指定ごみ袋に入ってもそ大ごみ）",
    "category": "敷物・室内用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 279,
    "name": "便器 （プラスチック）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 280,
    "name": "ボウリングのボール （指定ごみ袋に入ってもそ大ごみ）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 281,
    "name": "ポータブルトイレ",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 282,
    "name": "歩行器",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 283,
    "name": "ホワイトボード　大",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 284,
    "name": "ホワイトボード　小",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 285,
    "name": "本棚　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 286,
    "name": "本棚　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 287,
    "name": "マージャン台 （電動）（家庭用として使用していた場合に限る）",
    "category": "スポーツ・レジャー・遊具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 288,
    "name": "マッサージ機　大",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 289,
    "name": "マッサージ機　小",
    "category": "健康器具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 290,
    "name": "マットレス （スプリングなし）小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 291,
    "name": "マットレス （スプリング入り）",
    "category": "家具・寝具",
    "fee": 2600,
    "ticketCount": 1
  },
  {
    "id": 292,
    "name": "マットレス （スプリングなし）大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 293,
    "name": "万力 （指定ごみ袋に入ってもそ大ごみ）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 294,
    "name": "ミシン　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 295,
    "name": "ミシン　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 296,
    "name": "木材　小 （１ｍ以下に切断し、ひもで束ねる）",
    "category": "その他のもの",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 297,
    "name": "木材　大 （１ｍ以下に切断し、ひもで束ねる",
    "category": "その他のもの",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 298,
    "name": "物干し竿 （１ｍを超えるもの）",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 299,
    "name": "物干し竿と台のセット　小",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 300,
    "name": "物干し竿と台のセット　大",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 301,
    "name": "物干しスタンド （パラソル・室内用）",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 302,
    "name": "物干し台　小 （土台がブロック・石でも収集する）",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 303,
    "name": "物干し台　大 （土台がブロック・石でも収集する）",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 304,
    "name": "門扉　小",
    "category": "収納庫・室外用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 305,
    "name": "門扉　大",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 306,
    "name": "Ｕ字ロック （指定ごみ袋に入ってもそ大ごみ）",
    "category": "自転車類",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 307,
    "name": "よしず （３つまで重ねて300円）",
    "category": "敷物・室内用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 308,
    "name": "ラティス　小",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 309,
    "name": "ラティス　大",
    "category": "趣味・園芸・工具用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 310,
    "name": "リヤカー",
    "category": "自転車類",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 311,
    "name": "ルームランナー",
    "category": "健康器具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 312,
    "name": "冷風機　小 （指定ごみ袋に入ってもそ大ごみ、フロンガス回収済のみ）",
    "category": "家電製品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 313,
    "name": "冷風機　大 （指定ごみ袋に入ってもそ大ごみ、フロンガス回収済のみ）",
    "category": "家電製品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 314,
    "name": "レンジ台　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 315,
    "name": "レンジ台　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 316,
    "name": "レンチ （長さが30cm以下の場合はもやさないごみ）",
    "category": "趣味・園芸・工具用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 317,
    "name": "ロールカーテン　小",
    "category": "家具・寝具",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 318,
    "name": "ロールカーテン　大",
    "category": "家具・寝具",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 319,
    "name": "ロッカー",
    "category": "収納庫・室外用品",
    "fee": 600,
    "ticketCount": 2
  },
  {
    "id": 320,
    "name": "ワゴン　小",
    "category": "家事日用品",
    "fee": 300,
    "ticketCount": 1
  },
  {
    "id": 321,
    "name": "ワゴン　大",
    "category": "家事日用品",
    "fee": 600,
    "ticketCount": 2
  }
];
