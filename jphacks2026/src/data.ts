export const checkedAt = '2026-10-17';
const city = 'https://www.city.naha.okinawa.jp/kurasitetuduki/gomi-recycling/1001934/';
export const sources = {
 bulky: {title:'那覇市：そ大ごみ・スプリング入り製品',url:city+'1007525/1001941.html',checkedAt},
 reception: {title:'公式受付・支払い・収集条件',url:'https://www.naha-sodaigomi.com/receipts/home/',checkedAt},
 items: {title:'公式：品目リスト手数料検索',url:'https://www.naha-sodaigomi.com/receipts/home/item',checkedAt},
 appliance: {title:'那覇市：家電4品目',url:city+'1007526/1001942.html',checkedAt},
 pc: {title:'那覇市：パソコンの処分',url:city+'1007526/1001943.html',checkedAt},
 household: {title:'那覇市：もやさないごみ',url:city+'1007525/1001938.html',checkedAt},
 home: {title:'那覇市：家庭ごみ案内',url:city+'index.html',checkedAt},
 springStores: {title:'専用処理券の販売店舗（PDF）',url:'https://www.city.naha.okinawa.jp/_res/projects/default_project/_page_/001/001/941/supurinngushorikenn.pdf',checkedAt},
};
export type SourceKey=keyof typeof sources;
export type Category='bulky'|'spring'|'appliance'|'pc'|'household'|'restricted'|'business'|'unknown';
export type Question='spring'|'seats'|'bag'|'weight'|'dimensions'|'battery';
export interface Item {id:string;name:string;aliases:string[];category:Category;questions:Question[];rule:'standard'|'spring'|'fixed600'|'none';steps:string[];notes:string[];officialLinks:SourceKey[];sourceUrls:string[];checkedAt:string|null;status:'verified'|'needs-check'}
const commonSteps=['公式受付で品目・料金・収集日・排出場所を確認して申し込む。','受付で確定した料金を支払い、案内どおりに品物に表示する。','指定日の朝8時30分までに、指定された排出場所に出す。'];
function item(id:string,name:string,aliases:string[],category:Category='bulky',questions:Question[]=['bag','weight','dimensions'],rule:Item['rule']='standard',notes:string[]=[],links:SourceKey[]=['bulky','items','reception'],steps=commonSteps):Item {return {id,name,aliases,category,questions,rule,notes,steps,officialLinks:links,sourceUrls:links.map(k=>sources[k].url),checkedAt,status:'verified'};}
export const items:Item[]=[
 item('sofa','ソファー',['ソファ','そふぁ','そふぁー'], 'bulky',['spring','seats','bag','weight','dimensions'],'spring',['S字バネもスプリングに含まれます。ソファーベッドは公式品目リストで個別に確認してください。']),
 item('mattress','マットレス',['まっとれす'], 'bulky',['spring','bag','weight','dimensions'],'spring'),
 item('desk','机',['つくえ','デスク'], 'bulky',undefined,'standard',['学習机セットは別候補を選んでください。']),
 item('study-desk','学習机セット',['学習机','がくしゅうづくえ','机'], 'bulky',['weight','dimensions'],'fixed600',['取付け本棚・取付け照明・ワゴン引出しを含むセットの料金です。']),
 item('bicycle','自転車',['じてんしゃ','チャリ'], 'bulky',['battery','weight','dimensions']),
 item('ebike','電動自転車',['でんどうじてんしゃ','電動アシスト自転車','自転車'], 'bulky',['battery','weight','dimensions'],'fixed600',['バッテリーを取り外し、リサイクル協力店へ。']),
 item('microwave','電子レンジ',['でんしれんじ','レンジ'], 'bulky',['weight','dimensions'],'standard',['指定ごみ袋に入っても粗大ごみです。']),
 item('chest','タンス',['たんす','箪笥'], 'bulky',undefined,'standard',['分解しても上下一式で1点です。']),
 item('tvstand','テレビ台',['てれびだい'], 'bulky'),
 ...[['fridge','冷蔵庫',['れいぞうこ','冷凍庫','れいとうこ']],['tv','テレビ',['てれび']],['washer','洗濯機・衣類乾燥機',['洗濯機','せんたくき','乾燥機']],['ac','エアコン',['えあこん']]].map(([id,name,aliases])=>item(id as string,name as string,aliases as string[],'appliance',[],'none',['メーカー、型番、容量・画面サイズ、回収方法を確認してください。業務用として製造された機器は別途確認が必要です。'],['appliance','reception'],['買い替え先、購入店舗または市が案内する対応協力店へ相談する。','リサイクル料金と収集運搬料金を店舗に確認し、回収を依頼する。','自分で持ち込む場合は、市の案内に従いリサイクル券を用意する。'])),
 item('pc','パソコン',['ぱそこん','PC','ノートパソコン','パソコン本体'],'pc',[],'none',['データ消去は利用者自身で行ってください。無料回収には箱の大きさや重量などの条件があります。'],['pc','reception'],['市のパソコン処分案内で、宅配回収またはメーカー回収を選ぶ。','回収条件・追加サービスの料金を確認し、データを消去して申し込む。']),
 item('pan','フライパン',['ふらいぱん'],'household',['bag','weight'],'none',[],['household','bulky'],['もやさないごみの指定袋（青）に入れる。','地域のもやさないごみの日に出す。']),
 ...[['piano','ピアノ',['ぴあの']],['tire','タイヤ',['たいや']],['safe','耐火金庫',['金庫','きんこ']]].map(([id,name,aliases])=>item(id as string,name as string,aliases as string[],'restricted',[],'none',['市の粗大ごみ収集の対象外です。'],['reception'],['販売店や専門の処理業者へ相談する。処理先が不明な場合はクリーン推進課に問い合わせる。'])),
];
export function unknownItem(name:string):Item {return {id:'unknown',name,aliases:[],category:'unknown',questions:[],rule:'none',steps:['品名・材質・型番を整理し、公式の品目リストまたはクリーン推進課に確認する。'],notes:['未登録品目の料金や処分方法は推測しません。'],officialLinks:['items','reception'],sourceUrls:[],checkedAt:null,status:'needs-check'};}
export const rules={standard:{low:300,high:600,volumeBoundary:1,weightBoundary:10,sources:['bulky','items'] as SourceKey[],checkedAt},spring:{mattress:2600,oneSeat:1270,multiSeat:1940,sources:['bulky','items'] as SourceKey[],checkedAt},limits:{weight:50,lengthCm:500,sources:['reception'] as SourceKey[],checkedAt},fixed600:{amount:600,sources:['items'] as SourceKey[],checkedAt}};
