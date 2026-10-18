import test from 'node:test';
import assert from 'node:assert/strict';
import {extractLink,beginGmail,finishGmail} from './gmail.mjs';
const link='https://www.naha-sodaigomi.com/receipts/entry/auth?token=example&key=test';
function mail(text,from='受付 <notice@naha-sodaigomi.com>',time=2000){return {internalDate:String(time),payload:{mimeType:'text/html',headers:[{name:'From',value:from}],body:{data:Buffer.from(text).toString('base64url')}}};}
test('公式リンクだけを取り出しHTMLの&を復元する',()=>{
 assert.equal(extractLink(mail('<a href="'+link.replace('&','&amp;')+'">認証</a>'),1000),link);
 assert.equal(extractLink(mail(link),3000),null);
 assert.equal(extractLink(mail(link,'notice@evil.example'),1000),null);
 assert.equal(extractLink(mail('https://evil.example/receipts/auth?token=test'),1000),null);
 assert.equal(extractLink(mail('https://www.naha-sodaigomi.com/receipts/home/entry'),1000),null);
 assert.throws(()=>extractLink(mail(link+' '+link+'2'),1000),/複数/);
});
test('OAuthのstate・ブラウザーnonce不一致はトークン交換前に拒否する',async()=>{
 process.env.GOOGLE_CLIENT_ID='test';process.env.GOOGLE_CLIENT_SECRET='test';process.env.GOOGLE_REDIRECT_URI='http://127.0.0.1:5173/api/automation/gmail/callback';
 const c=beginGmail({applicationEmail:'test@example.invalid'},'session','http://127.0.0.1:5173');
 const params=new URL(c.url).searchParams;
 assert.equal(params.get('scope'),'https://www.googleapis.com/auth/gmail.readonly');
 assert.equal(params.get('code_challenge_method'),'S256');
 assert.throws(()=>beginGmail({},'session','http://10.0.0.1:5173'));
 const callback=new URL(process.env.GOOGLE_REDIRECT_URI+'?state='+params.get('state')+'&code=test');
 await assert.rejects(finishGmail(callback,'wrong',new Map()),/やり直し/);
 delete process.env.GOOGLE_CLIENT_ID;delete process.env.GOOGLE_CLIENT_SECRET;delete process.env.GOOGLE_REDIRECT_URI;
});
