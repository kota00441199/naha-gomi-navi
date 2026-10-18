export const OFFICIAL='https://www.naha-sodaigomi.com';
export function officialUrl(value){
 const u=new URL(value);
 if(u.origin!==OFFICIAL||u.username||u.password||!u.pathname.startsWith('/receipts/'))throw Error('那覇市公式受付のメールリンクを入力してください。');
 return u.href;
}
export function profileInput(value){
 const keys=['name','kana','phone','postal','town','block','number','building','room','housing','place'];
 const p=Object.fromEntries(keys.map(k=>[k,String(value?.[k]??'').trim()]));
 if(Object.values(p).some(v=>v.length>150))throw Error('入力が長すぎます。');
 p.name=p.name.replace(/[\s　]/g,'');p.kana=p.kana.replace(/[\s　]/g,'');
 p.phone=p.phone.normalize('NFKC').replace(/[-ー\s]/g,'');p.postal=p.postal.normalize('NFKC').replace(/[-ー\s]/g,'');
 if(!p.name||!p.kana||!/^\d{10,11}$/.test(p.phone)||!/^\d{7}$/.test(p.postal)||!p.town||!p.block)throw Error('氏名・フリガナ・電話番号・郵便番号・町名・番地を確認してください。');
 if(!['戸建','集合住宅'].includes(p.housing)||!['門口（市が収集する一戸建て及び集合住宅のごみ置場）','ステーション（近隣と共有のごみ置場）','許可収集'].includes(p.place))throw Error('住居形態と排出場所を選んでください。');
 if(p.housing==='集合住宅'&&!p.building)throw Error('建物名を入力してください。');
 return p;
}
export function itemInput(items){
 if(!Array.isArray(items)||!items.length||items.length>6)throw Error('1〜6点の品目を指定してください。');
 const result=items.map(i=>({name:typeof i?.name==='string'?i.name.trim():'',quantity:typeof i?.quantity==='number'||(typeof i?.quantity==='string'&&/^\d+$/.test(i.quantity.trim()))?Number(i.quantity):NaN}));
 if(result.some(i=>!i.name||i.name.length>100||!Number.isInteger(i.quantity)||i.quantity<1)||result.reduce((n,i)=>n+i.quantity,0)>6)throw Error('公式品目名と数量を確認してください。合計6点までです。');
 if(new Set(result.map(i=>i.name.replace(/\s/g,''))).size!==result.length)throw Error('同じ品目は数量をまとめてください。');
 return result;
}
export function datePolicyInput(policy){
 if(!policy||!['earliest','weekdays','manual'].includes(policy.mode))throw Error('収集日の選び方を設定してください。');

 if(policy.mode==='weekdays'&&(!Array.isArray(policy.weekdays)||!policy.weekdays.length||policy.weekdays.some(d=>!Number.isInteger(d)||d<0||d>6)))throw Error('希望曜日を1つ以上選んでください。');
 return policy;
}
export function chooseDate(candidates,policy,today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date())){
 datePolicyInput(policy);
 if(policy.mode==='manual')return null;
 if(!Array.isArray(candidates))throw Error('収集日の候補を確認してください。');
 const dates=candidates.filter(c=>c&&/^\d{4}-\d{2}-\d{2}$/.test(c.date)&&c.available===true&&c.date>=today).filter(c=>{const d=new Date(c.date+'T00:00:00Z');return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===c.date&&(policy.mode==='earliest'||policy.weekdays.includes(d.getUTCDay()));}).sort((a,b)=>a.date.localeCompare(b.date));
 if(!dates.length)throw Error('希望条件に合う空き日がありません。別の曜日には変更していません。');
 return dates[0];
}
