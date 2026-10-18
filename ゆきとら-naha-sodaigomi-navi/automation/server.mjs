import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {chromium} from 'playwright';
import {officialUrl,OFFICIAL} from './validation.mjs';
import {fillProfile,fillItems,runToDate,calendarDates} from './official.mjs';
const root=resolve(fileURLToPath(new URL('../out/',import.meta.url)));
const port=Number(process.env.PORT||3000),sessions=new Map();
let starting=0;
const allowedHosts=new Set((process.env.APP_HOSTS||'localhost,127.0.0.1,10.10.7.62').split(',').flatMap(h=>[h,`${h}:${port}`]));
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
async function body(req){let raw='';for await(const part of req){raw+=part;if(raw.length>32000)throw Error('入力が大きすぎます。');}return JSON.parse(raw||'{}');}
function token(req){return /(?:^|;\s*)naha_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];}
async function close(id){const s=sessions.get(id);sessions.delete(id);if(s)await s.browser.close().catch(()=>{});}
setInterval(()=>{for(const [id,s]of sessions)if(Date.now()-s.used>30*60*1000)void close(id);},60000).unref();
async function snapshot(s){
 const p=s.page;const revision=randomBytes(8).toString('hex');s.revision=revision;
 const fields=await p.evaluate(()=>{
  const controls=[...document.querySelectorAll('input,select,textarea,button,a[href]')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&e.type!=='hidden');
  return controls.map((e,index)=>{
   e.setAttribute('data-naha-control',String(index));
   const context=e.closest('tr');
   const associated=e.labels?.length?[...e.labels].map(l=>l.innerText).join(' '):'';
   let preceding='';let prev=e.previousElementSibling;
   for(let n=0;prev&&n<3;n++,prev=prev.previousElementSibling){if(prev.matches('input,select,textarea'))break;preceding=prev.innerText+' '+preceding;}
   let label=(associated||e.getAttribute('aria-label')||(e.tagName==='BUTTON'||e.tagName==='A'?e.innerText:'')||(e.type==='submit'||e.type==='button'?e.value:'')||preceding||e.placeholder||e.name||'入力欄').replace(/\s+/g,' ').trim().slice(0,220);
   if(location.pathname==='/receipts/home/entry'){
    if(e.name==='email')label='メールアドレス';
    if(e.name==='confirm')label='メールアドレス（確認用）';
    if(e.type==='checkbox')label='今回の申込品目は事業系そ大ごみではありません。また、その他前ページの注意事項に同意します。';
   }
   return {id:index,tag:e.tagName,type:e.type||'',label,context:context?.innerText.replace(/\s+/g,' ').slice(0,250)||'',value:e.type==='password'?'':e.value||'',checked:!!e.checked,disabled:!!e.disabled,options:e.tagName==='SELECT'?[...e.options].map(o=>({value:o.value,label:o.text,disabled:o.disabled})):undefined,href:e.tagName==='A'?e.href:undefined};
  });
 });
 if(new URL(p.url()).pathname==='/receipts/entry/calendar'){
  for(const c of (await calendarDates(p)).filter(c=>c.available)){
   const id=fields.length;
   await p.locator('table').nth(c.tableIndex).locator('tr').nth(c.rowIndex).locator(':scope > td,:scope > th').nth(c.column).evaluate((e,id)=>e.setAttribute('data-naha-control',String(id)),id);
   fields.push({id,tag:'BUTTON',type:'button',label:c.date+'（選択可能）',context:'',value:'',checked:false,disabled:false});
  }
 }
 return {revision,url:p.url().split('?')[0],title:await p.title(),fields,automation:s.automation||null,text:(await p.locator('body').innerText()).slice(0,14000)};
}
async function action(s,b){
 if(b.revision!==s.revision)throw Error('画面が更新されています。「画面を更新」を押してください。');
 const id=Number(b.id);if(!Number.isInteger(id)||id<0||id>1000)throw Error('操作対象が不正です。');
 const control=s.page.locator(`[data-naha-control="${id}"]`);if(await control.count()!==1)throw Error('入力欄が変わりました。画面を更新してください。');
 const tag=await control.evaluate(e=>({tag:e.tagName,type:e.type,href:e.href}));
 if(b.kind==='fill'&&['INPUT','TEXTAREA'].includes(tag.tag)&&!['checkbox','radio','hidden','submit','button','file','password'].includes(tag.type))await control.fill(String(b.value??'').slice(0,1000));
 else if(b.kind==='select'&&tag.tag==='SELECT')await control.selectOption(String(b.value));
 else if(b.kind==='check'&&['checkbox','radio'].includes(tag.type))await control.setChecked(!!b.value);
 else if(b.kind==='click'&&tag.tag==='TD'&&new URL(s.page.url()).pathname==='/receipts/entry/calendar'&&/^[○◯〇]$/.test((await control.innerText()).trim()))await control.click();
 else if(b.kind==='click'&&(tag.tag==='BUTTON'||['submit','button'].includes(tag.type)||tag.tag==='A')){
  if(tag.tag==='A')officialUrl(tag.href);
  await control.click();await s.page.waitForLoadState('domcontentloaded');
 }else throw Error('この操作は未対応です。');
}
const server=http.createServer(async(req,res)=>{
 try{
  if(!allowedHosts.has(req.headers.host))return json(res,403,{error:'接続先が許可されていません。'});
  const url=new URL(req.url,'http://'+req.headers.host);
  if(url.pathname.startsWith('/api/automation/')){
   if(req.method!=='GET'&&req.headers.origin!==`http://${req.headers.host}`)return json(res,403,{error:'アプリの画面から操作してください。'});
   if(req.method==='GET'&&req.headers['sec-fetch-site']==='cross-site')return json(res,403,{error:'別サイトからの操作はできません。'});
   if(url.pathname==='/api/automation/status')return json(res,200,{available:true,active:!!sessions.get(token(req))});
   if(url.pathname==='/api/automation/start'&&req.method==='POST'){
    if(sessions.has(token(req)))return json(res,200,await snapshot(sessions.get(token(req))));
    if(sessions.size+starting>=3)return json(res,429,{error:'利用中の画面が多いため、終了してから再度お試しください。'});
    const id=randomBytes(32).toString('hex');
    starting++;
    let browser;
    try{browser=await chromium.launch({headless:true});}catch(e){starting--;throw e;}
    try{
     const context=await browser.newContext({viewport:{width:390,height:844},locale:'ja-JP',acceptDownloads:false});
     // このブラウザーは那覇市公式受付専用。他のサイトへの移動を防ぐ。
     await context.route('**/*',async route=>{const r=route.request();if(r.isNavigationRequest()&&r.frame()===r.frame().page().mainFrame()){try{officialUrl(r.url());}catch{return route.abort();}}return route.continue();});
     const page=await context.newPage();page.setDefaultTimeout(10000);
     page.on('dialog',d=>void d.dismiss());
     context.on('page',p=>{if(p!==page)void p.close();});
     await page.goto(OFFICIAL+'/receipts/home/entry',{waitUntil:'domcontentloaded'});
     const s={browser,page,used:Date.now(),busy:false,revision:''};sessions.set(id,s);
     res.setHeader('Set-Cookie',`naha_session=${id}; HttpOnly; SameSite=Strict; Path=/api/automation; Max-Age=1800`);
     return json(res,200,await snapshot(s));
    }catch(e){await browser.close();throw e;}finally{starting--;}
   }
   const id=token(req),s=sessions.get(id);if(!s)return json(res,401,{error:'接続が終了しました。「専用ブラウザーを開始」を押してください。'});
   s.used=Date.now();res.setHeader('Set-Cookie',`naha_session=${id}; HttpOnly; SameSite=Strict; Path=/api/automation; Max-Age=1800`);
   if(url.pathname==='/api/automation/end'&&req.method==='POST'){await close(id);res.setHeader('Set-Cookie','naha_session=; HttpOnly; SameSite=Strict; Path=/api/automation; Max-Age=0');return json(res,200,{ended:true});}
   if(s.busy)return json(res,409,{error:'処理中です。少し待ってから操作してください。'});
   s.busy=true;
   try{
    if(req.method==='GET'&&url.pathname==='/api/automation/image'){
     const image=await s.page.screenshot({fullPage:true,type:'jpeg',quality:65});res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'no-store'});return res.end(image);
    }
    if(req.method==='GET'&&url.pathname==='/api/automation/state')return json(res,200,await snapshot(s));
    if(req.method!=='POST')return json(res,405,{error:'対応していない操作です。'});
    const b=await body(req);
    if(url.pathname==='/api/automation/open')await s.page.goto(officialUrl(b.url),{waitUntil:'domcontentloaded'});
    else if(url.pathname==='/api/automation/email'){
     if(new URL(s.page.url()).pathname!=='/receipts/home/entry')throw Error('メールアドレス入力画面を開いてください。');
     const email=String(b.email||'').trim();if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw Error('メールアドレスを確認してください。');
     const inputs=s.page.locator('input:visible:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button])');
     if(await inputs.count()!==2)throw Error('公式のメール入力欄が変わっています。');
     await inputs.nth(0).fill(email);await inputs.nth(1).fill(email);
    }
    else if(url.pathname==='/api/automation/profile')await fillProfile(s.page,b.profile);
    else if(url.pathname==='/api/automation/items')await fillItems(s.page,b.items);
    else if(url.pathname==='/api/automation/run')s.automation=await runToDate(s.page,b.settings);
    else if(url.pathname==='/api/automation/action')await action(s,b);
    else return json(res,404,{error:'対応していない操作です。'});
    return json(res,200,await snapshot(s));
   }finally{s.busy=false;}
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end();}
  try{
   if((await stat(path)).isDirectory()){
    const indexPath=resolve(path,'index.html');
    try{await stat(indexPath);path=indexPath;}catch{path=resolve(root,`${url.pathname.replace(/\/$/,'')}.html`);}
   }
  }catch{if(!extname(path))path+='.html';}
  const data=await readFile(path);const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.txt':'text/plain','.json':'application/json','.woff2':'font/woff2'};
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':extname(path)==='.html'?'no-store':'public, max-age=3600','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch(e){if(e.code==='ENOENT'){res.writeHead(404);res.end('Not found');}else json(res,400,{error:String(e.message||'操作できませんでした。').replace(/https?:\/\/[^\s]+/g,'（接続先）').slice(0,450)});}
});
server.listen(port,'0.0.0.0',()=>console.log(`App server listening on ${port}`));
for(const sig of ['SIGTERM','SIGINT'])process.on(sig,async()=>{server.close();await Promise.all([...sessions.keys()].map(close));process.exit(0);});
