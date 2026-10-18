'use client';
import {useEffect,useState} from 'react';
import type {Entry} from './engine';
type Field={id:number;tag:string;type:string;label:string;context:string;value:string;checked:boolean;disabled:boolean;options?:{value:string;label:string;disabled:boolean}[]};
type Remote={revision:string;url:string;title:string;text:string;fields:Field[];automation?:{date:string|null;message:string}};
const profileFields=[['name','氏名','name'],['kana','フリガナ','off'],['phone','電話番号','tel'],['postal','郵便番号','postal-code'],['town','町丁名（例：奥武山町）','address-level3'],['block','番地（番）','off'],['number','号（ない場合は空欄）','off'],['building','建物名','off'],['room','部屋番号','off']] as const;
const emptyProfile={name:'',kana:'',phone:'',postal:'',town:'',block:'',number:'',building:'',room:'',housing:'',place:''};
function Control({field,disabled,onAction}:{field:Field;disabled:boolean;onAction:(kind:string,id:number,value?:string|boolean)=>void}){
 const [value,setValue]=useState(field.value);
 const label=field.label||'入力欄';
 if(field.type==='password'||field.type==='file')return null;
 if(field.tag==='A'||field.tag==='BUTTON'||['submit','button'].includes(field.type))return <button type="button" className="secondary" disabled={disabled||field.disabled} onClick={()=>onAction('click',field.id)}>{label}</button>;
 if(['checkbox','radio'].includes(field.type))return <label className="remote-check"><input type={field.type} checked={field.checked} disabled={disabled||field.disabled} onChange={e=>onAction('check',field.id,e.target.checked)}/>{field.context||label}</label>;
 return <div className="remote-field"><label>{field.context||label}{field.tag==='SELECT'?<select value={value} onChange={e=>{setValue(e.target.value);onAction('select',field.id,e.target.value);}} disabled={disabled||field.disabled}>{field.options?.map((o,n)=><option key={n} value={o.value} disabled={o.disabled}>{o.label}</option>)}</select>:<input value={value} disabled={disabled||field.disabled} onChange={e=>setValue(e.target.value)} onBlur={()=>{if(value!==field.value)onAction('fill',field.id,value);}} type={['email','tel','number','date'].includes(field.type)?field.type:'text'}/>}</label></div>;
}
const SETTINGS_KEY='naha-application-settings-v1';
type Policy={mode:'weekdays'|'earliest'|'manual';weekdays:number[]};
export default function AutomationPanel({entries}:{entries:Entry[]}){
 const [remote,setRemote]=useState<Remote|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[url,setUrl]=useState(''),[email,setEmail]=useState(''),[profile,setProfile]=useState(emptyProfile),[available,setAvailable]=useState<boolean|null>(null);
 const [remember,setRemember]=useState(false),[saved,setSaved]=useState(false),[showImage,setShowImage]=useState(false);
 const [policy,setPolicy]=useState<Policy>({mode:'weekdays',weekdays:[]});
 const [plans,setPlans]=useState<{name:string;quantity:number}[]>([]);
 useEffect(()=>{
  try{const raw=localStorage.getItem(SETTINGS_KEY);if(raw){const v=JSON.parse(raw);if(v.version===1){setEmail(String(v.email||''));setProfile(Object.fromEntries(Object.keys(emptyProfile).map(k=>[k,String(v.profile?.[k]||'')])) as typeof emptyProfile);if(['weekdays','earliest','manual'].includes(v.policy?.mode))setPolicy({mode:v.policy.mode,weekdays:Array.isArray(v.policy.weekdays)?v.policy.weekdays.filter((d:number)=>Number.isInteger(d)&&d>=0&&d<=6):[]});if(Array.isArray(v.plans))setPlans(v.plans.slice(0,6));setRemember(true);setSaved(true);}}}catch{setError('保存設定を読み込めませんでした。設定し直してください。');}
  fetch('/api/automation/status').then(r=>r.ok?r.json():null).then(async v=>{setAvailable(v?.available===true);if(v?.active){const r=await fetch('/api/automation/state');if(r.ok){const page=await r.json();setRemote(page);if(page.fields?.some((f:Field)=>f.label.includes('注意事項に同意して申込みを進める')))setNotice('メール認証済みです。公式の注意事項を確認して同意すると、自動入力を開始します。');}}}).catch(()=>setAvailable(false));
 },[]);
 useEffect(()=>{setPlans(ps=>ps.length?ps:entries.filter(e=>['bulky','spring'].includes(e.result.category)).map(e=>({name:e.item.id==='microwave'&&e.result.unit!==null?`${e.item.name} ${e.result.unit===300?'小':'大'}`:e.item.name,quantity:e.answers.quantity})));},[entries]);
 const settings={profile,email,items:plans,datePolicy:policy};
 function save(){try{if(remember)localStorage.setItem(SETTINGS_KEY,JSON.stringify({version:1,email,profile,policy,plans}));else localStorage.removeItem(SETTINGS_KEY);setSaved(true);setError('');setNotice(remember?'この端末に設定を保存しました。次回は入力不要です。':'今回の利用中だけ設定を保持します。');}catch{setError('設定を保存できませんでした。この画面を閉じずにご利用ください。');}}
 function forget(){try{localStorage.removeItem(SETTINGS_KEY);setRemember(false);setSaved(false);setNotice('端末に保存した設定を削除しました。現在の入力は終了するまで残ります。');}catch{setError('削除できませんでした。ブラウザーのサイトデータを確認してください。');}}
 async function request(route:string,data?:unknown):Promise<Remote|undefined>{
  setBusy(true);setError('');setNotice('');
  try{const r=await fetch('/api/automation/'+route,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});const value=await r.json();if(!r.ok)throw Error(value.error||'操作できませんでした。');if(value.ended){setRemote(null);setUrl('');setNotice('専用ブラウザーを終了しました。端末に保存した設定は次回も使えます。');}else if(value.revision){setRemote(value);setNotice(value.automation?.message||'公式画面を更新しました。');return value;}}
  catch(e){setError(e instanceof Error?e.message:'接続できませんでした。');}finally{setBusy(false);}
 }
 async function start(){const page=await request('start',{});if(page?.url.endsWith('/home/entry')&&email){const filled=await request('email',{email});if(filled)setNotice('メールアドレスを入力しました。まだ送信していません。下の注意事項を確認してチェックし、「メールアドレス送信」を押してください。');}}
 async function resume(){await request('run',{settings});}
 async function openAndRun(){
  const page=await request('open',{url:url.trim()});
  if(!page)return;
  if(page.fields.some(f=>f.label.includes('注意事項に同意して申込みを進める'))){setUrl('');setNotice('メール認証ができました。公式の注意事項を確認し、下の「注意事項に同意して申込みを進める」を押すと自動入力を開始します。');}
  else if(['/entry/profile','/entry/map','/entry/item','/entry/calendar'].some(path=>page.url.endsWith(path))){setUrl('');await resume();}
  else {setNotice('');setError(page.url.endsWith('/home/index')||page.url.endsWith('/home/entry')?'メール認証が完了せず、公式の受付ページに戻りました。住所の自動入力はまだ始まっていません。メール本文のリンクを長押し（PCでは右クリック）して「リンクをコピー」し、貼り付けてください。開いた後のアドレスでは認証できない場合があります。':'認証後の入力画面に進めませんでした。下の公式画面の文章を確認してください。');}
 }
 async function action(kind:string,id:number,value?:string|boolean){
  if(!remote)return;const f=remote.fields.find(f=>f.id===id);
  if(kind==='click'&&f&&/送信|申込|申し込|決済|確定|支払|同意/.test(f.label)&&!/戻る|入力/.test(f.label)&&!window.confirm(`公式サイトの「${f.label}」を実行します。内容を確認しましたか？`))return;
  const page=await request('action',{revision:remote.revision,kind,id,value});
  if(page&&kind==='click'&&f?.label.includes('注意事項に同意して申込みを進める')&&page.url.endsWith('/entry/profile'))await resume();
 }
 const consent=remote?.fields.find(f=>f.label.includes('注意事項に同意して申込みを進める'));
 const canRun=!consent&&remote&&['/entry/profile','/entry/map','/entry/item','/entry/calendar'].some(p=>remote.url.endsWith(p));
 return <details className="automation-panel"><summary><strong>公式申込の自動入力</strong><span>メール・住所・品目・希望曜日を保存して使う（試験版）</span></summary><div className="automation-body">
  <p>初回に設定すれば、次回から保存したメール・住所・品目を使用します。認証後は住所入力から希望日に合う収集日の選択まで進めます。</p>
  <p className="muted">メール認証・公式の注意事項への同意・最終申込・支払いは本人が行います。専用ブラウザーは30分操作しないと終了します。保存を選んだ情報はこの端末のブラウザーに残り、共有端末では他の利用者にも見える場合があります。</p>
  <details className="automation-step" open={!saved}><summary><strong>初回設定・保存内容を変更</strong></summary>
   <label>メールアドレス<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <div className="profile-grid">{profileFields.map(([key,label,autocomplete])=><label key={key}>{label}<input autoComplete={autocomplete} value={profile[key]} inputMode={['phone','postal','block','number','room'].includes(key)?'numeric':undefined} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/></label>)}<label>住居形態<select value={profile.housing} onChange={e=>setProfile(p=>({...p,housing:e.target.value}))}><option value="">選択してください</option><option>戸建</option><option>集合住宅</option></select></label><label>排出場所<select value={profile.place} onChange={e=>setProfile(p=>({...p,place:e.target.value}))}><option value="">選択してください</option>{['門口（市が収集する一戸建て及び集合住宅のごみ置場）','ステーション（近隣と共有のごみ置場）','許可収集'].map(t=><option key={t}>{t}</option>)}</select></label></div>
   <h3>収集日の選び方</h3><label>日付の条件<select value={policy.mode} onChange={e=>setPolicy(p=>({...p,mode:e.target.value as Policy['mode']}))}><option value="weekdays">希望曜日の中で最短の日</option><option value="earliest">曜日を問わず最短の日</option><option value="manual">毎回、自分で選ぶ</option></select></label>
   {policy.mode==='weekdays'&&<fieldset><legend>希望曜日（複数選択可）</legend><div className="weekday-options">{['日','月','火','水','木','金','土'].map((day,i)=><label key={day}><input type="checkbox" checked={policy.weekdays.includes(i)} onChange={e=>setPolicy(p=>({...p,weekdays:e.target.checked?[...p.weekdays,i]:p.weekdays.filter(d=>d!==i)}))}/>{day}曜日</label>)}</div></fieldset>}
   <p className="muted">希望曜日に空きがなければ停止します。別の曜日へ勝手に変更しません。</p>
   <h3>申込品目</h3>{plans.map((p,i)=><div className="plan-row" key={i}><label>公式品目名<input value={p.name} onChange={e=>setPlans(ps=>ps.map((v,n)=>n===i?{...v,name:e.target.value}:v))}/></label><label>数量<input type="number" min="1" max="6" value={p.quantity} onChange={e=>setPlans(ps=>ps.map((v,n)=>n===i?{...v,quantity:Number(e.target.value)}:v))}/></label><button type="button" className="text-button" onClick={()=>setPlans(ps=>ps.filter((_,n)=>n!==i))}>除く</button></div>)}<button className="secondary" type="button" disabled={plans.length>=6} onClick={()=>setPlans(ps=>[...ps,{name:'',quantity:1}])}>品目を追加</button>
   <label className="remote-check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>メール・住所・電話番号・品目・希望曜日をこの端末に保存する</label><div className="assist-actions"><button className="primary" type="button" onClick={save}>設定を保存</button><button className="text-button" type="button" onClick={forget}>保存設定を削除</button></div>
  </details>
  {saved&&<p className="official-note">{remember?'保存した設定を使用':'今回の設定を使用'}：{profile.name} ／ {plans.reduce((n,p)=>n+p.quantity,0)}点 ／ {policy.mode==='weekdays'?`希望曜日：${policy.weekdays.length?policy.weekdays.map(i=>'日月火水木金土'[i]).join('・'):'未設定'}`:policy.mode==='earliest'?'最短の空き日':'日付は手動選択'}</p>}
  {available===false&&<p role="alert" className="notice">自動入力サーバーに接続できません。起動用PCのアプリサーバーを確認してください。</p>}
  <div className="assist-actions"><button className="primary" type="button" disabled={busy||available===false||!email} onClick={start}>{remote?'設定のメールを公式へ入力':'設定した内容で開始'}</button>{remote&&<><button className="secondary" type="button" disabled={busy} onClick={()=>request('state')}>画面を更新</button><button className="text-button" type="button" disabled={busy} onClick={()=>request('end',{})}>専用ブラウザーを終了</button></>}</div>
  <p role="status" aria-live="polite">{busy?'公式画面を操作しています…':notice}</p>{error&&<p role="alert" className="notice">{error} {remote&&'一部入力済みの場合があります。「画面を更新」で確認してください。'}</p>}
  {remote&&<>
   <section className="automation-step"><h3>メール認証後、そのまま自動入力</h3><p>初回は下の公式画面で注意事項に同意して確認メールを送信してください。メール本文の元のリンクをコピーし、ここに貼り付けます。設定した情報を公式受付に転記し、希望条件に合う日付の選択まで進めます。</p><form onSubmit={e=>{e.preventDefault();void openAndRun();}}><label>公式メールのリンク<input type="url" required value={url} onChange={e=>setUrl(e.target.value)} autoComplete="off" placeholder="https://www.naha-sodaigomi.com/receipts/…"/></label><button className="primary" type="submit" disabled={busy}>認証して住所・品目・日付を自動入力</button></form>{canRun&&<button className="secondary" type="button" disabled={busy} onClick={resume}>この画面から自動入力を続ける</button>}</section>
   {consent&&<section className="automation-step"><h3>公式の注意事項を確認</h3><p>確認して同意すると、保存した住所・品目の入力を開始します。</p><pre className="assist-memo">{remote.text.slice(remote.text.indexOf('そ大ごみお申込みに関する注意事項')).split('Copyright')[0]}</pre><button className="primary" type="button" disabled={busy} onClick={()=>action('click',consent.id)}>注意事項に同意して申込みを進める</button></section>}
   <details className="automation-step" open={remote.url.endsWith('/home/entry')?true:undefined}><summary>{remote.url.endsWith('/home/entry')?'確認メールを送信する':'公式画面を手動で確認・修正する'}</summary><p className="muted">現在のページ：{remote.url}。入力欄から移動すると自動反映されます。選択項目は選ぶと反映されます。</p><div className="remote-controls">{remote.fields.filter(f=>f.id!==consent?.id).map(f=><Control key={`${remote.revision}-${f.id}`} field={f} disabled={busy} onAction={action}/>)}</div></details>
   <details className="automation-step"><summary>公式画面の文章を確認</summary><pre className="assist-memo">{remote.text}</pre></details>
   <details className="automation-step" onToggle={e=>setShowImage(e.currentTarget.open)}><summary>公式画面の画像を確認</summary>{showImage&&!busy&&<img className="remote-image" src={'/api/automation/image?v='+remote.revision} alt="専用ブラウザーで開いている那覇市公式受付の画面"/>}</details>
  </>}
 </div></details>;
}
