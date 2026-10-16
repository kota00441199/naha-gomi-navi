// 実際のGemini通信を使う確認。キーは環境変数か、非表示の標準入力で渡す。
import fs from 'node:fs/promises';
import { load } from './compile.mjs';
const {analyze}=await load('lib/analyze');
let key=process.env.GEMINI_API_KEY;
if(!key){
 if(process.stdin.isTTY){const{execFileSync}=await import('node:child_process');execFileSync('stty',['-echo'],{stdio:['inherit','inherit','inherit']});}
 process.stdout.write('Ready for API key on stdin (input hidden).\n');
 key=await new Promise(resolve=>{process.stdin.setEncoding('utf8');let s='';process.stdin.on('data',chunk=>{s+=chunk;if(s.includes('\n')){process.stdin.pause();resolve(s.trim());}});});
}
for(const name of process.argv.slice(2)){
 const bytes=await fs.readFile(name);const f=new FormData();f.append('file',new File([bytes],name.endsWith('.png')?'test.png':'test.jpg'));f.append('notes','');
 const start=Date.now();const r=await analyze(new Request('https://test.invalid/api/analyze',{method:'POST',body:f}),{apiKey:key,model:'gemini-3.5-flash-lite',consumeQuota:async()=>true});
 console.log(JSON.stringify({file:name.split('/').at(-1),seconds:Math.round((Date.now()-start)/100)/10,status:r.status,body:await r.json()}));
}
process.exit(0);
