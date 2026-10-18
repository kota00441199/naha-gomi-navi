import {randomBytes,createHash} from 'node:crypto';
import {officialUrl} from './validation.mjs';
const pending=new Map();
const scope='https://www.googleapis.com/auth/gmail.readonly';
export const gmailConfigured=()=>Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REDIRECT_URI);
async function google(url,options={}){
 const response=await fetch(url,{...options,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(response.status===401?'Gmailの接続期限が切れました。再接続してください。':'Gmailに接続できません。Googleの設定・権限を確認してください。');
 return response.json();
}
export function beginGmail(session,id,origin){
 if(!gmailConfigured())throw Error('Gmail接続の初期設定が必要です。official-auto-input/README.mdを確認してください。');
 const redirect=new URL(process.env.GOOGLE_REDIRECT_URI);
 if(redirect.origin!==origin||redirect.pathname!=='/api/automation/gmail/callback')throw Error('Googleの接続設定と同じURLでアプリを開いてください。');
 for(const [key,p]of pending)if(p.expires<Date.now()||p.id===id)pending.delete(key);
 const state=randomBytes(32).toString('hex'),nonce=randomBytes(32).toString('hex'),verifier=randomBytes(32).toString('base64url');
 pending.set(state,{id,nonce,verifier,expires:Date.now()+600000,origin});
 const params=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:redirect.href,response_type:'code',scope,state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',prompt:'select_account',login_hint:session.applicationEmail||''});
 return {url:'https://accounts.google.com/o/oauth2/v2/auth?'+params,nonce};
}
export async function finishGmail(url,nonce,sessions){
 const state=url.searchParams.get('state'),p=pending.get(state);pending.delete(state);
 if(!p||p.expires<Date.now()||!nonce||p.nonce!==nonce||url.origin!==p.origin)throw Error('Gmail接続をやり直してください。');
 const session=sessions.get(p.id);if(!session)throw Error('専用ブラウザーを開始し直してください。');
 if(url.searchParams.has('error')||!url.searchParams.get('code'))throw Error('Google接続がキャンセルされました。');
 const tokens=await google('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({code:url.searchParams.get('code'),client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:process.env.GOOGLE_REDIRECT_URI,grant_type:'authorization_code',code_verifier:p.verifier})});
 if(!tokens.access_token||!tokens.scope?.split(' ').includes(scope))throw Error('Gmailの読み取り権限を許可してください。');
 const account=await google('https://gmail.googleapis.com/gmail/v1/users/me/profile',{headers:{Authorization:'Bearer '+tokens.access_token}});
 if(account.emailAddress.toLowerCase()!==session.applicationEmail?.toLowerCase())throw Error('申込メールアドレスと同じGmailアカウントを選んでください。');
 session.gmail={token:tokens.access_token,email:account.emailAddress,expires:Date.now()+Number(tokens.expires_in||3600)*1000};
 session.used=Date.now();
}
function payloadText(payload){
 const own=['text/plain','text/html'].includes(payload?.mimeType)&&payload.body?.data?Buffer.from(payload.body.data,'base64url').toString('utf8'):'';
 return own+'\n'+(payload?.parts||[]).map(payloadText).join('\n');
}
export function extractLink(message,since){
 if(!Number.isFinite(Number(message.internalDate))||Number(message.internalDate)<since)return null;
 const headers=message.payload?.headers||[];
 const from=headers.find(h=>h.name.toLowerCase()==='from')?.value||'';
 if(!/(?:^|[<\s])[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@naha-sodaigomi\.com(?:>|\s|$)/i.test(from))return null;
 const text=payloadText(message.payload).replace(/&amp;/gi,'&').replace(/&#38;/g,'&');
 const links=[...new Set((text.match(/https:\/\/[^\s<>"']+/g)||[]).filter(link=>{
  try{const u=new URL(officialUrl(link));return Boolean(u.search)&&!['/receipts/home/entry','/receipts/home/index'].includes(u.pathname);}catch{return false;}
 }))];
 if(links.length>1)throw Error('認証リンクの候補が複数あります。メール本文のリンクを手動で貼り付けてください。');
 return links[0]||null;
}
export async function findGmailLink(session){
 const g=session.gmail;
 if(!g||g.expires<=Date.now())throw Error('Gmailに接続してください。');
 if(g.email.toLowerCase()!==session.applicationEmail?.toLowerCase())throw Error('メールアドレスが変わりました。Gmailに再接続してください。');
 if(!session.mailSince)throw Error('先に公式画面へメールアドレスを入力してください。');
 if(session.gmailChecked&&Date.now()-session.gmailChecked<4000)return {waiting:true};
 session.gmailChecked=Date.now();
 const headers={Authorization:'Bearer '+g.token};
 const q='from:(@naha-sodaigomi.com) after:'+Math.floor(session.mailSince/1000);
 const list=await google('https://gmail.googleapis.com/gmail/v1/users/me/messages?'+new URLSearchParams({q,maxResults:'10'}),{headers});
 const messages=[];
 for(const entry of list.messages||[])messages.push(await google('https://gmail.googleapis.com/gmail/v1/users/me/messages/'+encodeURIComponent(entry.id)+'?format=full',{headers}));
 messages.sort((a,b)=>Number(b.internalDate)-Number(a.internalDate));
 for(const message of messages){const link=extractLink(message,session.mailSince);if(link)return {link};}
 return {waiting:true};
}
