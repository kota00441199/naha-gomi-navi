import {items,rules,type Item,type Category} from './data';
export interface Answers {origin:'home'|'business'|'unknown';quantity:number;spring:'yes'|'no'|'unknown';seats:'1'|'2'|'unknown';bag:'yes'|'no'|'unknown';battery:'yes'|'no'|'unknown';weight?:number;width?:number;depth?:number;height?:number;}
export const initialAnswers:Answers={origin:'home',quantity:1,spring:'unknown',seats:'unknown',bag:'unknown',battery:'unknown'};
export interface Estimate {category:Category;title:string;unit:number|null;range?:[number,number];reason:string;ticket:string;eligible:boolean;}
export const normalize=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/[\s・ー]/g,'');
export function search(query:string){const q=normalize(query);return q?items.filter(i=>[i.name,...i.aliases].some(s=>normalize(s).includes(q)||q.includes(normalize(s)))):[];}
export function volume(a:Answers){return [a.width,a.depth,a.height].every(n=>n!==undefined&&Number.isFinite(n)&&n>0)?a.width!*a.depth!*a.height!/1_000_000:undefined;}
export function estimate(i:Item,a:Answers):Estimate {
 const {low,high,weightBoundary,volumeBoundary}=rules.standard;
 const pending=(category:Category,title:string,reason:string,range?:[number,number]):Estimate=>({category,title,reason,unit:null,range,ticket:'料金・券種は公式確認が必要',eligible:false});
 if(!Number.isInteger(a.quantity)||a.quantity<1||a.quantity>99||[a.weight,a.width,a.depth,a.height].some(n=>n!==undefined&&(!Number.isFinite(n)||n<=0)))return pending('unknown','入力内容を確認してください','数量は1〜99の整数、重量と寸法は正の数で入力してください。');
 if(a.origin==='business')return pending('business','事業活動から出るごみです','市の家庭向け収集は利用できません。契約業者へ相談。木製家具などは環境政策課（098-951-3231）へ。家庭用の家電4品目は事業所で使用していても家電リサイクルの対象です。');
 if(a.origin==='unknown')return pending('unknown','使用場所の公式確認が必要です','家庭で使っていたものか確認してください。');
 if(i.category==='appliance')return pending('appliance','家電リサイクルの対象です','市の粗大ごみでは収集しません。メーカー・サイズ・回収方法により料金が異なるため、購入店舗等で確認してください。');
 if(i.category==='pc')return pending('pc','パソコンの別回収制度を利用します','市の粗大ごみでは収集しません。宅配・メーカー回収の条件と料金を確認してください。');
 if(i.category==='restricted'||i.status==='needs-check')return pending(i.category,i.category==='restricted'?'市の粗大ごみでは収集できません':'公式確認が必要です',i.notes[0]);
 if((a.weight??0)>=rules.limits.weight||Math.max(a.width??0,a.depth??0,a.height??0)>=rules.limits.lengthCm)return pending('restricted','収集制限にあたるため、問い合わせが必要です','概ね50kg以上、または長さ概ね5m以上は収集運搬が困難なため収集できないと案内されています。');
 if(i.category==='household')return a.bag==='yes'&&a.weight!==undefined&&a.weight<=weightBoundary?pending('household','通常の家庭ごみ（もやさないごみ）です','青い指定ごみ袋で排出。袋代はこの見積もりに含めず、別途確認とします。'):pending('unknown','袋に入るか・重量を確認してください','袋に入らない場合や重量物は粗大ごみとなります。この品目の粗大ごみ料金は公式確認が必要です。');
 if(i.id==='bicycle'&&a.battery!=='no')return pending('unknown','電動自転車か確認してください','電動の場合は「電動自転車」を選び直してください。バッテリーの処分も別に必要です。');
 const paid=(n:number,reason:string,spring=false):Estimate=>({category:spring?'spring':'bulky',title:spring?'スプリング入り製品として処分します':'通常の粗大ごみとして処分します',unit:n,reason,ticket:spring?`適正処理困難物処理券（${n.toLocaleString()}円・この品目専用）1枚／点`:`そ大ごみ処理券（300円）${n/low}枚／点`,eligible:true});
 if(i.rule==='spring'&&a.spring==='unknown')return pending('unknown','スプリングの有無を確認してください','コイル状・S字のバネがあるか、製品表示やメーカーに確認してください。通常券を先に購入しないでください。');
 if(i.rule==='spring'&&a.spring==='yes'){
  if(i.id==='sofa'&&a.seats==='unknown')return pending('spring','スプリング入りソファーです','1人掛け1,270円／2人掛け以上1,940円。人数が未確認です。',[rules.spring.oneSeat,rules.spring.multiSeat]);
  return paid(i.id==='mattress'?rules.spring.mattress:a.seats==='1'?rules.spring.oneSeat:rules.spring.multiSeat,'公式品目別の専用料金。通常料金は加算しません。',true);
 }
 if(i.questions.includes('bag')&&a.bag!=='no'&&!(a.weight!==undefined&&a.weight>weightBoundary))return pending('unknown','通常ごみか粗大ごみかの確認が必要です','指定ごみ袋（大）に入るか、重量物にあたるかを確認してください。材質による分別は公式の家庭ごみ案内で確認できます。');
 if(i.rule==='fixed600')return paid(rules.fixed600.amount,'公式の品目別料金を適用。一般の寸法・重量による料金より優先します。');
 const v=volume(a);
 if((a.weight!==undefined&&a.weight>weightBoundary)||(v!==undefined&&v>=volumeBoundary))return paid(high,'重量10kg超、または外寸から求めた体積が1m³以上。外寸体積は判定の目安です。');
 if(a.weight!==undefined&&v!==undefined)return paid(low,'重量10kg以下、かつ外寸から求めた体積が1m³未満。外寸体積は判定の目安です。');
 return pending('bulky','通常の粗大ごみです（料金は条件付き）','重量または体積が不明。1m³未満かつ10kg以下なら300円（通常券1枚）、それ以外は600円（通常券2枚）。',[low,high]);
}
export interface Entry {key:string;item:Item;answers:Answers;result:Estimate;}
export function totals(entries:Entry[]){return {subtotal:entries.reduce((s,e)=>s+(e.result.unit===null?0:e.result.unit*e.answers.quantity),0),known:entries.filter(e=>e.result.unit!==null),pending:entries.filter(e=>e.result.unit===null),count:entries.reduce((s,e)=>s+e.answers.quantity,0)};}
export function disposalSteps(i:Item,r:Estimate,payment:'ticket'|'cashless'){
 if(r.category==='business')return ['家庭向けの公式収集には申し込まず、契約業者や担当課へ処分方法を確認してください。'];
 if(!['bulky','spring'].includes(r.category))return r.category==='household'?i.steps:r.eligible?i.steps:[r.reason,...(['appliance','pc','restricted'].includes(i.category)?i.steps:['クリーン推進課へ品名・寸法・重量を伝えて確認してください。'])];
 return [i.steps[0],payment==='ticket'?'受付で確定した券種と枚数を購入し、4桁の受付番号を書いて各品物の見やすい場所に貼る。':'インターネット受付でクレジットカードまたはPayPayを選択し決済。「申込み完了のお知らせ」を確認する。',...(payment==='cashless'?['各品物に「4桁の受付番号・収集日・そ大ごみ」を書いた紙を貼る。雨で消えない油性ペンを使い、四辺をテープで固定する。']:[]),'指定日の朝8時30分までに、受付で指定された場所へ出す。'];
}
