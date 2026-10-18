import {profileInput,itemInput,officialUrl,datePolicyInput} from './validation.mjs';
const textInputs=p=>p.locator('input:visible:not([type=hidden]):not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio])');
async function assertPage(p,path,title){officialUrl(p.url());if(new URL(p.url()).pathname!==path||!await p.getByText(title,{exact:true}).count())throw Error(`${title}画面を開いてください。メール認証が必要な場合は、メール内の元のリンクを開いてください。`);}
async function settle(p){await p.waitForLoadState('domcontentloaded');}
export async function fillProfile(p,value){
 const v=profileInput(value);await assertPage(p,'/receipts/entry/profile','申込者情報入力');
 let inputs=textInputs(p);if(![6,8].includes(await inputs.count()))throw Error('公式の入力欄の構成が変わっています。自動入力を止めました。');
 for(const [i,key] of ['name','kana','phone','postal'].entries())await inputs.nth(i).fill(v[key]);
 await p.getByRole('button',{name:'住所を検索',exact:true}).click();await settle(p);
 await assertPage(p,'/receipts/entry/profile','申込者情報入力');
 let selects=p.locator('select:visible');if(await selects.count()!==3)throw Error('住所の選択欄を確認できません。');
 await selects.nth(0).selectOption({label:v.town});
 inputs=textInputs(p);await inputs.nth(4).fill(v.block);await inputs.nth(5).fill(v.number);
 await selects.nth(1).selectOption({label:v.housing});
 inputs=textInputs(p);
 if(v.housing==='集合住宅'){
  await inputs.nth(7).waitFor({state:'visible'});
  if(await inputs.count()!==8)throw Error('建物名と部屋番号の欄を確認してください。');
  await inputs.nth(6).fill(v.building);await inputs.nth(7).fill(v.room);
 }
 await selects.nth(2).selectOption({label:v.place});
 // この操作は入力だけ。住所確認・品目への遷移は本人が画面で行う。
}
export async function fillItems(p,value){
 const items=itemInput(value);await assertPage(p,'/receipts/entry/item','品目選択');
 if(await p.locator('input[type=checkbox]:checked').count())throw Error('すでに選択済みの品目があります。重複を防ぐため、公式画面で選択を確認してから操作してください。');
 const completed=[];
 try{
  for(const item of items){
   const search=textInputs(p);if(await search.count()!==1)throw Error('品目検索欄を特定できません。');
   await search.fill(item.name.replace(/[ 　]+[大小]$/,''));await p.getByRole('button',{name:/^\s*検索\s*$/}).click();await settle(p);
   const rows=p.locator('tr').filter({has:p.locator('input[type=checkbox]')});
   let matches=[];
   for(let i=0;i<await rows.count();i++){
    const row=rows.nth(i);const cells=await row.locator('td').allTextContents();
    if(cells.some(c=>c.replace(/\s/g,'')===item.name.replace(/\s/g,'')))matches.push(row);
   }
   if(matches.length!==1)throw Error(`「${item.name}」に完全一致する公式品目がありません。公式画面の名称を確認してください。`);
   const row=matches[0];await row.locator('input[type=checkbox]').check();
   completed.push(item.name);
   const quantity=row.locator('select:visible,input[type=number]:visible,input[type=text]:visible');
   if(await quantity.count()===1){if(await quantity.evaluate(e=>e.tagName)==='SELECT')await quantity.selectOption({label:String(item.quantity)});else await quantity.fill(String(item.quantity));}
   else if(item.quantity!==1)throw Error(`「${item.name}」の数量を公式画面で指定してください。`);
  }
 }catch(e){throw Error(`${e.message}${completed.length?' 選択済み：'+completed.join('、')+'。画面で確認してください。':''}`);}
}

export async function calendarDates(p){
 officialUrl(p.url());
 if(new URL(p.url()).pathname!=='/receipts/entry/calendar')throw Error('排出日選択画面を開いてください。');
 return p.evaluate(()=>{
  const result=[];
  [...document.querySelectorAll('table')].forEach((table,tableIndex)=>{
   const range=document.createRange();range.setStart(document.body,0);range.setEndBefore(table);
   const months=[...range.toString().matchAll(/(20\d{2})年\s*(\d{1,2})月/g)];
   const own=(table.caption?.innerText||'').match(/(20\d{2})年\s*(\d{1,2})月/);
   const month=own||months.at(-1);if(!month)return;
   let days=[];
   [...table.querySelectorAll('tr')].forEach((row,rowIndex)=>{
    const cells=[...row.querySelectorAll(':scope > td,:scope > th')];if(cells.length!==7)return;
    const texts=cells.map(c=>c.innerText.trim());
    if(texts.some(t=>/^\d{1,2}$/.test(t))&&texts.every(t=>!t||/^\d{1,2}$/.test(t))){days=texts;return;}
    if(days.length&&texts.some(t=>/^[○◯〇×]$/.test(t))){
     texts.forEach((text,column)=>{if(!/^\d{1,2}$/.test(days[column]))return;result.push({date:`${month[1]}-${month[2].padStart(2,'0')}-${days[column].padStart(2,'0')}`,available:/^[○◯〇]$/.test(text),tableIndex,rowIndex,column});});days=[];
    }
   });
  });return result;
 });
}
export async function selectCalendarDate(p,policy){
 officialUrl(p.url());
 const {chooseDate}=await import('./validation.mjs');
 const dates=await calendarDates(p);const chosen=chooseDate(dates,policy);if(!chosen)return null;
 const cell=p.locator('table').nth(chosen.tableIndex).locator('tr').nth(chosen.rowIndex).locator(':scope > td,:scope > th').nth(chosen.column);
 if(!/^[○◯〇]$/.test((await cell.innerText()).trim()))throw Error('空き状況が変わりました。再確認してください。');
 await cell.click();
 return chosen.date;
}
// 明示した中間画面だけを進める。最終申込・支払いボタンは一切押さない。
export async function runToDate(p,settings){
 officialUrl(p.url());
 const {profile,items,datePolicy}=settings;
 const v=profileInput(profile);itemInput(items);
 datePolicyInput(datePolicy);
 let path=new URL(p.url()).pathname;
 if(path==='/receipts/entry/profile'){
  await fillProfile(p,v);await p.getByRole('button',{name:'次へ（自宅確認）',exact:true}).click();await settle(p);path=new URL(p.url()).pathname;
  if(path==='/receipts/entry/map')return {date:null,message:'住所を入力しました。公式画面の地図で場所を確認してから、品目入力へ進んでください。'};
 }
 if(path==='/receipts/entry/map'){
  await p.getByRole('button',{name:'次へ（品目選択）',exact:true}).click();await settle(p);path=new URL(p.url()).pathname;
 }
 if(path==='/receipts/entry/item'){
  await fillItems(p,items);await p.getByRole('button',{name:'次へ（排出日選択）',exact:true}).first().click();await settle(p);path=new URL(p.url()).pathname;
 }
 if(path==='/receipts/entry/calendar'){
  const date=await selectCalendarDate(p,datePolicy);
  return {date,message:date?`${date}を選択しました。公式画面で確認し「排出日決定」を押してください。まだ申込は確定していません。`:'収集日を公式画面で選んでください。'};
 }
 throw Error('メール認証が必要か、未対応の画面です。公式画面を確認してください。');
}
