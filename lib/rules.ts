// 担当4: 自治体の公式資料から確認した案内。AIに分別ルールを作らせない。
export const SOURCES = {
    recycling: 'https://www.city.naha.okinawa.jp/kurasitetuduki/gomi-recycling/1001934/1007525/1001940.html',
    dictionary: 'https://www.city.naha.okinawa.jp/kurasitetuduki/gomi-recycling/1001934/1008613.html',
    danger: 'https://www.city.naha.okinawa.jp/kurasitetuduki/gomi-recycling/1001934/1007525/1001939.html',
    collection: 'https://www.city.naha.okinawa.jp/kurasitetuduki/gomi-recycling/1001934/1008614.html',
};
export const CHECKED_ON = '2026-10-09';
export const ITEM_IDS = ['pet', 'can', 'glass', 'newspaper', 'cardboard', 'carton'] as const;
export type ItemId = typeof ITEM_IDS[number];
export type Rule = {
    id: ItemId;
    name: string;
    short: string;
    category: string;
    checks: string[];
    steps: string[];
    note: string;
};
const paper = ['紙の種類ごとにまとめ、ひもで束ねる。袋には入れない。', '濡れないよう、雨の日の排出を避ける。'];
export const RULES: Record<ItemId, Rule> = {
    pet: { id: 'pet', name: '飲料用ペットボトル', short: 'ペットボトル', category: '資源化物（ペットボトル）',
        checks: ['飲み物の容器で、PETマークを確認できる'],
        steps: ['キャップとラベルを外し、中を空にして軽くすすぐ。', 'できる範囲でつぶし、びん・缶とは別の透明な袋へ。'],
        note: 'プラスチック製キャップは、那覇市では「もやすごみ」。PETマークが分からない場合は公式検索へ。' },
    can: { id: 'can', name: '飲料用の缶', short: '飲料缶', category: '資源化物（かん）',
        checks: ['飲み物の缶で、スプレー缶やガス容器ではない', '高さ・幅など、どの一辺も20cm未満である'],
        steps: ['中を空にして軽くすすぎ、外せるラベルやふたは外す。', 'できる範囲でつぶし、他の種類と分けて透明な袋へ。'],
        note: '一辺が20cm以上の缶は、この案内の対象外。市の分別検索で確認してください。' },
    glass: { id: 'glass', name: '飲料用のガラスびん', short: '飲料びん', category: '資源化物（びん）',
        checks: ['飲み物のガラスびんで、化粧品のびんやコップではない', '割れていない'],
        steps: ['キャップとラベルを外し、中を空にして軽くすすぐ。', '缶・ペットボトルとは分けて透明な袋へ。'],
        note: 'プラスチック製のふた・コルクは「もやすごみ」、金属製のふたは「かん」。割れたものは公式の危険ごみ案内へ。' },
    newspaper: { id: 'newspaper', name: '新聞紙', short: '新聞', category: '資源化物（紙）',
        checks: ['新聞紙であり、レシート・写真・汚れた紙ではない'],
        steps: [...paper], note: '新聞紙の案内です。紙製品すべてに同じ方法を当てはめないでください。' },
    cardboard: { id: 'cardboard', name: '段ボール', short: '段ボール', category: '資源化物（紙）',
        checks: ['段ボールで、汚れや特殊なコーティングがない'],
        steps: ['テープと紙以外の付属物を取り外す。', ...paper],
        note: '汚れや材質が分からない場合は、公式の品目検索で確認してください。' },
    carton: { id: 'carton', name: '内側が白い飲料用紙パック', short: '紙パック', category: '資源化物（紙）',
        checks: ['飲料用の紙パックで、内側が白いと確認できる（銀色ではない）'],
        steps: ['中を洗い、切り開いて乾かす。', ...paper],
        note: '内側が銀色の紙パックは、那覇市では「もやすごみ」。外観だけでは判断できません。' },
};
export function isItemId(value: unknown): value is ItemId {
    return typeof value === 'string' && (ITEM_IDS as readonly string[]).includes(value);
}
// 担当1・2: 確認漏れがある間は、確定した分別案内を表示しない。
export function canShowRule(id: ItemId, checked: boolean[]): boolean {
    return checked.length === RULES[id].checks.length && checked.every(Boolean);
}
