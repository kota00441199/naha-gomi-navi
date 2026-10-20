import {useRef,useState} from 'react';

type Address={address1:string;address2:string;address3:string};
const normalize=(value:string)=>value.normalize('NFKC').replace(/[-ー−‐\s]/g,'');
export default function PostalLookup({value,onChange,onAddress}:{value:string;onChange:(value:string)=>void;onAddress:(postal:string,town:string)=>void}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[choices,setChoices]=useState<Address[]>([]);
 const sequence=useRef(0);
 function change(next:string){sequence.current++;setBusy(false);setMessage('');setChoices([]);onChange(next);}
 function apply(address:Address){onAddress(value,address.address3);setChoices([]);setMessage(`${address.address1}${address.address2}${address.address3}を入力しました。番地・建物名を続けて入力してください。`);}
 async function search(){
  const postal=normalize(value),id=++sequence.current;
  setChoices([]);setMessage('');
  if(!/^\d{7}$/.test(postal)){setMessage('郵便番号を7桁で入力してください。');return;}
  setBusy(true);
  try{
   const response=await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postal}`,{signal:AbortSignal.timeout(10000),credentials:'omit',referrerPolicy:'no-referrer'});
   if(!response.ok)throw Error();
   const data=await response.json();
   if(id!==sequence.current)return;
   if(data.status!==200)throw Error();
   if(!data.results?.length){setMessage('住所が見つかりませんでした。郵便番号を確認するか、町丁名を直接入力してください。');return;}
   const addresses:Address[]=data.results.filter((a:Address)=>a.address1==='沖縄県'&&a.address2==='那覇市'&&typeof a.address3==='string'&&a.address3&&!a.address3.includes('以下に掲載'));
   if(!addresses.length){setMessage('那覇市の町丁名を特定できませんでした。郵便番号を確認し、町丁名を直接入力してください。');return;}
   if(addresses.length===1)apply(addresses[0]);
   else{setChoices(addresses);setMessage('該当する町丁名を選んでください。');}
  }catch{if(id===sequence.current)setMessage('住所を検索できませんでした。再検索するか、町丁名を直接入力してください。');}
  finally{if(id===sequence.current)setBusy(false);}
 }
 return <div className="postal-lookup"><label>郵便番号<input autoComplete="postal-code" inputMode="numeric" value={value} placeholder="例：900-0021" onChange={e=>change(e.target.value)}/></label><button type="button" className="secondary" disabled={busy} onClick={()=>void search()}>{busy?'住所を検索中…':'郵便番号から住所を入力'}</button><small>郵便番号のみを住所検索サービス（zipcloud）へ送信します。</small><p role="status" aria-live="polite">{message}</p>{choices.length>0&&<label>町丁名の候補<select defaultValue="" onChange={e=>{const address=choices[Number(e.target.value)];if(address)apply(address);}}><option value="" disabled>選択してください</option>{choices.map((a,i)=><option key={i} value={i}>{a.address1}{a.address2}{a.address3}</option>)}</select></label>}</div>;
}
