import {useEffect,useState} from 'react';
export default function GmailImport({onLink}:{onLink:(link:string)=>void}) {
 const [configured,setConfigured]=useState<boolean|null>(null),[connected,setConnected]=useState(false),[watching,setWatching]=useState(false),[message,setMessage]=useState('Gmail接続を確認しています…');
 useEffect(()=>{
  let stopped=false,running=false;
  const deadline=Date.now()+120000;
  async function check(){
   if(running)return;running=true;
   try{
    const status=await fetch('/api/automation/gmail/status');
    const state=await status.json();if(!status.ok)throw Error(state.error||'Gmail接続を確認できません。');
    if(stopped)return;
    setConfigured(state.configured);setConnected(state.connected);setMessage(current=>current==='Gmail接続を確認しています…'?'':current);
    if(!watching)return;
    if(Date.now()>deadline){setWatching(false);setMessage('受信待ちを終了しました。確認メールを送信済みか確認し、もう一度取得してください。');return;}
    if(!state.connected)return;
    const response=await fetch('/api/automation/gmail/link',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    const value=await response.json();if(!response.ok)throw Error(value.error||'確認メールを取得できません。');
    if(stopped)return;
    if(value.link){onLink(value.link);setWatching(false);setMessage('確認メールのリンクを反映しました。下の認証ボタンで進めてください。');}
    else setMessage('確認メールの到着を待っています…（最大2分）');
   }catch(e){if(!stopped){setWatching(false);setMessage(e instanceof Error?e.message:'Gmailに接続できません。');}}
   finally{running=false;}
  }
  void check();const timer=setInterval(()=>void check(),5000);
  return()=>{stopped=true;clearInterval(timer);};
 },[watching,onLink]);
 async function connect(){
  const popup=window.open('about:blank','naha-gmail-connect','popup,width=520,height=720');
  if(!popup){setMessage('ポップアップを許可してから、もう一度接続してください。');return;}
  try{
   const response=await fetch('/api/automation/gmail/connect',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const value=await response.json();
   if(!response.ok)throw Error(value.error||'Gmailに接続できません。');
   popup.location.href=value.url;setWatching(true);setMessage('別画面でGoogleへの接続を許可してください。接続後、確認メールを自動取得します。');
  }catch(e){popup.close();setMessage(e instanceof Error?e.message:'接続できません。');}
 }
 async function disconnect(){
  setWatching(false);
  try{const r=await fetch('/api/automation/gmail/disconnect',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error();setConnected(false);setMessage('このアプリのGmail接続を終了しました。');}catch{setMessage('接続を終了できませんでした。再度お試しください。');}
 }
 return <section className="automation-step"><h3>Gmailからリンクを自動取得</h3>
  <p className="muted">申込先と同じGoogleアカウントを接続します。今回の開始後に届いた公式メールを検索し、リンクを入力欄に反映します。メールの送信・削除は行いません。</p>
  {configured===false&&<div className="notice"><strong>このアプリのGmail接続は準備中です</strong><p>アプリ管理者によるGoogle接続設定が必要なため、現在は接続ボタンを利用できません。準備が完了するまでは、届いたメールのリンクを下の欄へ貼り付けて進められます。</p></div>}
  {configured===true&&!connected&&<div className="official-note"><strong>初回はGoogleの画面で接続を許可してください</strong><ol style={{display:'block'}}><li>「Gmailを接続して自動取得」を押す</li><li>申込メールアドレスと同じGoogleアカウントでログインする</li><li>Gmailの読み取り権限を確認し、許可する</li><li>接続完了の画面を閉じて、このページに戻る</li></ol><p>接続後は確認メールを自動で探します。最終申し込みはご本人が内容を確認して行います。</p></div>}
  {connected&&<p className="official-note">Gmailに接続済みです。確認メールを送信したら「確認メールを自動取得」を押してください。取得したリンクが下の欄に入ります。</p>}
  <div className="assist-actions">
   {!connected&&<button type="button" className="secondary" disabled={!configured||watching} onClick={connect}>Gmailを接続して自動取得</button>}
   {connected&&<><button type="button" className="secondary" disabled={watching} onClick={()=>{setWatching(true);setMessage('確認メールを探しています…');}}>確認メールを自動取得</button><button type="button" className="text-button" onClick={disconnect}>Gmail接続を終了</button></>}
   {watching&&<button type="button" className="text-button" onClick={()=>setWatching(false)}>受信待ちを停止</button>}
  </div><p role="status" aria-live="polite">{message}</p>
 </section>;
}
