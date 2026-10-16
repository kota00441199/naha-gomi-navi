import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from './compile.mjs';
const {analyze}=await load('lib/analyze');
const {consumeQuota}=await load('lib/quota');
const {parseClassification}=await load('lib/classification');
const {RULES,ITEM_IDS,canShowRule}=await load('lib/rules');
const {RuleGuide}=await load('components/RuleGuide');
const {default:App}=await load('app/page');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH1cAAAAASUVORK5CYII=','base64');
const good={itemId:'pet',confidence:'high',observation:'透明な飲料容器が見えます。'};
function request(data=png,notes='',include=true){const f=new FormData();if(include)f.append('file',new File([data],'test.png',{type:'image/png'}));f.append('notes',notes);return new Request('https://test.invalid/api/analyze',{method:'POST',body:f});}
const reply=(value=good,finish='STOP')=>Response.json({candidates:[{finishReason:finish,content:{parts:[{text:JSON.stringify(value)}]}}]});
const opts=(other={})=>({apiKey:'fake-test-key',model:'gemini-3.5-flash-lite',consumeQuota:async()=>true,fetcher:async()=>reply(),...other});
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS '+name);}
await check('画像と補足を1回のGemini依頼にまとめJSONを返す',async()=>{let calls=0;const r=await analyze(request(png,'飲み物の容器'),opts({fetcher:async(url,init)=>{calls++;const p=JSON.parse(init.body);assert.equal(p.contents[0].parts[0].inlineData.mimeType,'image/png');assert.equal(p.generationConfig.responseMimeType,'application/json');assert.match(p.contents[0].parts[1].text,/飲み物/);return reply();}}));assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.deepEqual((await r.json()).classification,good);assert.equal(calls,1);});
await check('キー未設定は外部通信しない',async()=>assert.equal((await analyze(request(),opts({apiKey:'',consumeQuota:()=>assert.fail(),fetcher:()=>assert.fail()}))).status,503));
for(const [name,make,status] of [
 ['画像なし',()=>request(png,'',false),422],['補足301文字',()=>request(png,'あ'.repeat(301)),422],['不正画像',()=>request(Buffer.from('invalid picture')),400],['5MB超',()=>request(new Uint8Array(5*1024*1024+1)),413],
 ['本文サイズ超過',()=>new Request('https://test.invalid',{method:'POST',headers:{'Content-Type':'multipart/form-data; boundary=x'},body:new Uint8Array(6*1024*1024)}),413],
 ['不正multipart',()=>new Request('https://test.invalid',{method:'POST',headers:{'Content-Type':'multipart/form-data; boundary=x'},body:'broken'}),400],
 ['JSON誤送信',()=>new Request('https://test.invalid',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}),415],
])await check(name+'をAI送信前に拒否',async()=>assert.equal((await analyze(make(),opts({consumeQuota:()=>assert.fail()}))).status,status));
await check('複数画像を拒否',async()=>{const f=new FormData();for(let i=0;i<2;i++)f.append('file',new File([png],'t.png'));assert.equal((await analyze(new Request('https://test.invalid',{method:'POST',body:f}),opts({consumeQuota:()=>assert.fail()}))).status,422);});
await check('日次上限で外部通信しない',async()=>assert.equal((await analyze(request(),opts({consumeQuota:async()=>false,fetcher:()=>assert.fail()}))).status,429));
await check('DB障害で外部通信しない',async()=>assert.equal((await analyze(request(),opts({consumeQuota:async()=>{throw Error('private');},fetcher:()=>assert.fail()}))).status,503));
for(const [status,expected]of [[401,502],[403,502],[404,502],[429,429],[503,502]])await check('Google '+status+'の処理と秘密の非表示',async()=>{const r=await analyze(request(),opts({fetcher:async()=>new Response('fake-test-key',{status})}));assert.equal(r.status,expected);assert(!(await r.text()).includes('fake-test-key'));});
await check('タイムアウトを504にする',async()=>{const r=await analyze(request(),opts({timeoutMs:1,fetcher:async(u,i)=>new Promise((res,rej)=>i.signal.addEventListener('abort',()=>rej(Error('timeout'))))}));assert.equal(r.status,504);});
await check('通信障害は502',async()=>assert.equal((await analyze(request(),opts({fetcher:async()=>{throw Error('fake-test-key');}}))).status,502));
for(const [name,value]of [['不明な品目ID',{...good,itemId:'made-up'}],['欠けた項目',{itemId:'pet'}],['長すぎる観察文',{...good,observation:'あ'.repeat(161)}]])await check(name+'を拒否',async()=>assert.equal((await analyze(request(),opts({fetcher:async()=>reply(value)}))).status,502));
await check('壊れたJSONを拒否',async()=>assert.equal((await analyze(request(),opts({fetcher:async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:'not json'}]}}]})}))).status,502));
await check('途中終了した回答を拒否',async()=>assert.equal((await analyze(request(),opts({fetcher:async()=>reply(good,'MAX_TOKENS')}))).status,502));
await check('安全ブロックや空回答を拒否',async()=>assert.equal((await analyze(request(),opts({fetcher:async()=>Response.json({candidates:[]})}))).status,502));
await check('低確信の品目はunknownにする',async()=>assert.equal(parseClassification({...good,confidence:'low'}).itemId,'unknown'));
await check('低確信でも危険物の可能性を維持',async()=>assert.equal(parseClassification({...good,itemId:'hazard',confidence:'low'}).itemId,'hazard'));
await check('全6品目の確認前後と件数の不整合',async()=>{for(const id of ITEM_IDS){assert.equal(canShowRule(id,[]),false);assert.equal(canShowRule(id,RULES[id].checks.map(()=>false)),false);assert.equal(canShowRule(id,RULES[id].checks.map(()=>true)),true);assert.equal(canShowRule(id,[...RULES[id].checks.map(()=>true),true]),false);}});
await check('缶は2条件を両方確認する',async()=>{assert.equal(canShowRule('can',[true,false]),false);assert.equal(canShowRule('can',[false,true]),false);assert.equal(canShowRule('can',[true,true]),true);});
await check('紙パック内側とPETマークの条件を保持',async()=>{assert.match(RULES.carton.checks.join(''),/内側.*白/);assert.match(RULES.pet.checks.join(''),/PETマーク/);assert.match(RULES.carton.note,/銀色.*もやすごみ/);});
await check('画面HTMLと未確認の案内をサーバーレンダー',async()=>{const html=renderToStaticMarkup(React.createElement(App));assert.match(html,/那覇ごみナビ/);assert.match(html,/<button[^>]*type="button"[^>]*>.*?カメラで撮る<\/button>/);assert.match(html,/type="file"/);assert.match(html,/品目から調べる/);for(const id of ITEM_IDS){const guide=renderToStaticMarkup(React.createElement(RuleGuide,{id,origin:'manual'}));assert.match(guide,/disabled/);assert(!guide.includes('class="disposal"'));}});
await check('SQLiteで並行25回の試行を20回へ制限',async()=>{
 const db=new DatabaseSync(':memory:');const f=(await fs.readdir('drizzle')).find(x=>x.endsWith('.sql'));db.exec(await fs.readFile('drizzle/'+f,'utf8'));
 const adapter={prepare(sql){return{bind(...args){return{async first(){return db.prepare(sql).get(...args)||null;}};}};}};
 const result=await Promise.all(Array.from({length:25},()=>consumeQuota(adapter,'20')));assert.equal(result.filter(Boolean).length,20);assert.equal(db.prepare('select used from ai_daily_usage').get().used,20);db.close();
});
console.log(`${passed} checks passed. Gemini mocked; browser interactions not tested.`);
