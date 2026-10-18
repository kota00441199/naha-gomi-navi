import test from 'node:test';import assert from 'node:assert/strict';
import {officialUrl,profileInput,itemInput} from './validation.mjs';
test('公式受付以外のURL・認証情報を含むURLを拒否',()=>{for(const u of ['http://www.naha-sodaigomi.com/receipts/entry','https://evil.example/receipts/entry','https://www.naha-sodaigomi.com.evil.example/receipts/entry','https://user@www.naha-sodaigomi.com/receipts/entry','file:///etc/passwd','https://www.naha-sodaigomi.com/other'])assert.throws(()=>officialUrl(u));assert.equal(officialUrl('https://www.naha-sodaigomi.com/receipts/entry/profile?lang=ja'),'https://www.naha-sodaigomi.com/receipts/entry/profile?lang=ja');});
test('数量の上限・不正値・重複を拒否',()=>{for(const q of [0,7,-1,1.5,NaN])assert.throws(()=>itemInput([{name:'電子レンジ 大',quantity:q}]));assert.throws(()=>itemInput([{name:'電子レンジ 大',quantity:4},{name:'机',quantity:3}]));assert.throws(()=>itemInput([{name:'電子レンジ 大',quantity:1},{name:'電子レンジ　大',quantity:1}]));assert.deepEqual(itemInput([{name:'電子レンジ 大',quantity:2}]),[{name:'電子レンジ 大',quantity:2}]);});
test('住所に不足があると転記前に停止',()=>{assert.throws(()=>profileInput({}));const p={name:'試験 太郎',kana:'シケン タロウ',phone:'０９０-００００-００００',postal:'９００-００２６',town:'奥武山町',block:'26',housing:'集合住宅',place:'門口（市が収集する一戸建て及び集合住宅のごみ置場）'};assert.throws(()=>profileInput(p));const valid=profileInput({...p,building:'検証用'});assert.equal(valid.phone,'09000000000');assert.equal(valid.postal,'9000026');assert.equal(valid.name,'試験太郎');});
import {chooseDate} from './validation.mjs';
test('希望曜日の最短日を選び、満席・過去日を除く',()=>{const list=[{date:'2026-11-02',available:true},{date:'2026-10-26',available:true},{date:'2026-10-19',available:false},{date:'2026-10-12',available:true},{date:'2026-10-27',available:true}];assert.equal(chooseDate(list,{mode:'weekdays',weekdays:[1]},'2026-10-17').date,'2026-10-26');assert.equal(chooseDate(list,{mode:'weekdays',weekdays:[2]},'2026-10-17').date,'2026-10-27');assert.throws(()=>chooseDate(list,{mode:'weekdays',weekdays:[6]},'2026-10-17'));assert.throws(()=>chooseDate(list,{mode:'weekdays',weekdays:[]},'2026-10-17'));assert.equal(chooseDate(list,{mode:'manual'},'2026-10-17'),null);assert.throws(()=>chooseDate([{date:'2026-02-30',available:true}],{mode:'earliest'},'2026-01-01'));});

test('数量の暗黙変換と不正な品目を拒否し、数値文字列は受理',()=>{
 for(const quantity of [true,false,[1],{},'0x2','1e0'])assert.throws(()=>itemInput([{name:'机',quantity}]));
 for(const item of [null,undefined,{name:{},quantity:1}])assert.throws(()=>itemInput([item]),/公式品目名と数量/);
 assert.deepEqual(itemInput([{name:'机',quantity:' 2 '}]),[{name:'机',quantity:2}]);
});
test('空き状況は真偽値trueのみを受理',()=>{
 const candidates=[null,{date:'2026-10-19',available:'false'},{date:'2026-10-20',available:1},{date:'2026-10-21',available:true}];
 assert.equal(chooseDate(candidates,{mode:'earliest'},'2026-10-18').date,'2026-10-21');
 assert.throws(()=>chooseDate(null,{mode:'earliest'}),/候補/);
});

import {runToDate,fillItems} from './official.mjs';
test('曜日が配列でない場合は画面操作前に検証エラー',async()=>{
 const profile={name:'試験太郎',kana:'シケンタロウ',phone:'09000000000',postal:'9000026',town:'奥武山町',block:'26',housing:'戸建',place:'許可収集'};
 await assert.rejects(runToDate({url:()=> 'https://www.naha-sodaigomi.com/receipts/entry/item'}, {profile,items:[{name:'机',quantity:1}],datePolicy:{mode:'weekdays',weekdays:'1'}}),/希望曜日/);
});
test('数量入力失敗時もチェック済み品目を通知',async()=>{
 let checked=false;
 const row={locator(selector){
  if(selector==='td')return {allTextContents:async()=>['机']};
  if(selector==='input[type=checkbox]')return {check:async()=>{checked=true;}};
  return {count:async()=>1,evaluate:async()=> 'SELECT',selectOption:async()=>{throw Error('数量入力失敗');}};
 }};
 const rows={count:async()=>1,nth:()=>row};
 const page={url:()=> 'https://www.naha-sodaigomi.com/receipts/entry/item',getByText:()=>({count:async()=>1}),getByRole:()=>({click:async()=>{}}),waitForLoadState:async()=>{},locator(selector){
  if(selector==='input[type=checkbox]:checked')return {count:async()=>0};
  if(selector==='tr')return {filter:()=>rows};
  return {count:async()=>1,fill:async()=>{}};
 }};
 await assert.rejects(fillItems(page,[{name:'机',quantity:2}]),/数量入力失敗 選択済み：机/);
 assert.equal(checked,true);
});
