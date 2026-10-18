 'use client';
import {useEffect,useRef,useState} from 'react';
import type {Item} from '@/lib/data';
import type {Answers} from '@/lib/engine';
type Key='origin'|'quantity'|'spring'|'seats'|'battery'|'bag'|'limits'|'weightBand'|'volumeBand';
type Question={key:Key;label:string;hint?:string;options?:[string,string][]};
const unsure:[string,string]=['unknown','わからない'];
function questions(item:Item,a:Answers):Question[]{
 const result:Question[]=[{key:'origin',label:'どこで使っていたものですか？',options:[['home','家庭'],['business','事業所・店舗'],unsure]},{key:'quantity',label:'数量（点）',hint:'同じ仕様のものだけをまとめます。違う仕様は別の品目として追加してください。'}];
 if(a.origin!=='home'||!item.questions.length)return result;
 if(item.questions.includes('spring'))result.push({key:'spring',label:'スプリング（金属のバネ）は入っていますか？',hint:'S字バネも含みます。不明なら製品ラベルやメーカーに確認してください。',options:[['yes','入っている'],['no','入っていない'],unsure]});
 if(item.id==='sofa'&&a.spring==='yes')result.push({key:'seats',label:'何人掛けですか？',options:[['1','1人掛け'],['2','2人掛け以上'],unsure]});
 if(item.questions.includes('battery'))result.push({key:'battery',label:'バッテリーはありますか？',options:[['yes','ある'],['no','ない'],unsure]});
 if(item.category==='bulky')result.push({key:'limits',label:'概ね50kg以上、または長さ概ね5m以上ですか？',hint:'市が収集できる範囲を確認します。数値の入力は不要です。',options:[['no','どちらも未満'],['yes','いずれかに当てはまる'],unsure]});
 if(a.limits==='yes')return result;
 const regular=item.rule==='standard'||(item.rule==='spring'&&a.spring==='no')||item.category==='household';
 if(regular){
  if(item.questions.includes('bag'))result.push({key:'bag',label:'那覇市の指定ごみ袋（大）に入りますか？',options:[['yes','入る'],['no','入らない'],unsure]});
  result.push({key:'weightBand',label:'重さは10kg以下ですか？',hint:'測定値は入力しません。判断できなければ「わからない」を選んでください。',options:[['under','10kg以下'],['over','10kgを超える'],unsure]});
  if(item.category!=='household'&&a.weightBand!=='over')result.push({key:'volumeBand',label:'体積は1m³未満ですか？',hint:'1m³は縦・横・高さがそれぞれ1mの箱の体積です。形状で判断しづらい場合は「わからない」を選んでください。',options:[['under','1m³未満'],['over','1m³以上'],unsure]});
 }
 return result;
}
export default function QuestionWizard({item,answers,onChange,onComplete,onCancel,editing}:{item:Item;answers:Answers;onChange:(a:Answers)=>void;onComplete:(a:Answers)=>void;onCancel:()=>void;editing:boolean}){
 const [index,setIndex]=useState(0);const [transitioning,setTransitioning]=useState(true);const [answered,setAnswered]=useState<Key[]>([]);const [confirmed,setConfirmed]=useState(false);const heading=useRef<HTMLHeadingElement>(null);const lastMove=useRef(0);
 const list=questions(item,answers);const q=list[index];const complete=list.every(q=>answered.includes(q.key));
 useEffect(()=>{heading.current?.focus();setTransitioning(true);const timer=setTimeout(()=>setTransitioning(false),450);return ()=>clearTimeout(timer);},[index]);
 function choose(key:Key,value:string|number){const next={...answers,[key]:value};
 // Remove old numeric measurements and dependent answers so hidden values cannot set the fee.
 next.weight=undefined;next.width=undefined;next.depth=undefined;next.height=undefined;
 const position=list.findIndex(q=>q.key===key);const later=list.slice(position+1).map(q=>q.key);
 for(const dependent of ['weightBand','volumeBand'] as const)if(later.includes(dependent)||key==='origin'||key==='spring')next[dependent]=undefined;
 onChange(next);setAnswered(prev=>[...prev.filter(k=>!later.includes(k)),key]);setConfirmed(false);
 }
 const valid=q?.key==='quantity'?Number.isInteger(answers.quantity)&&answers.quantity>0&&answers.quantity<=99:!!q&&answered.includes(q.key);
 function next(){if(!q||!valid||Date.now()-lastMove.current<450)return;lastMove.current=Date.now();setAnswered(prev=>prev.includes(q.key)?prev:[...prev,q.key]);setIndex(index+1);}
 return <fieldset className="wizard-controls" disabled={transitioning}><p className="eyebrow">STEP 02 / {q?`質問 ${index+1} / ${list.length}`:'回答の確認'}</p><h2 id="question-title" ref={heading} tabIndex={-1}>{item.name}{editing?'を編集':''}</h2>
 {q?<div key={q.key} className="question-step"><h3>{q.label}</h3>{q.hint&&<p className="muted">{q.hint}</p>}{q.key==='quantity'?<label className="number-label">数量（点）<input type="number" inputMode="numeric" min="1" max="99" step="1" value={Number.isNaN(answers.quantity)?'':answers.quantity} onChange={e=>choose('quantity',e.target.valueAsNumber)}/></label>:<fieldset><legend className="sr-only">{q.label}</legend><div className="choices">{q.options?.map(([v,t])=><label key={v} className={answered.includes(q.key)&&answers[q.key]===v?'chosen':''}><input type="radio" name={q.key} value={v} checked={answered.includes(q.key)&&answers[q.key]===v} onChange={()=>choose(q.key,v)}/>{t}</label>)}</div></fieldset>}<p className="muted">{q.key!=='quantity'&&!answered.includes(q.key)?'回答を選ぶと次へ進めます。「わからない」も選べます。':'この回答で次の質問へ進みます。'}</p><button key={`next-${q.key}`} className="primary" type="button" disabled={!valid||transitioning} onClick={next}>次へ →</button></div>:<div className="answer-review"><h3>すべての回答を確認してください</h3><dl>{list.map(q=><div key={q.key}><dt>{q.label}</dt><dd>{q.key==='quantity'?`${answers.quantity}点`:q.options?.find(([v])=>v===answers[q.key])?.[1]}</dd></div>)}</dl><label className="review-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>回答を確認しました</label><button className="primary" type="button" disabled={!complete||!confirmed} onClick={()=>{if(complete&&confirmed)onComplete(answers);}}>{editing?'変更を保存する':'処分方法・料金を見る'}</button></div>}
 <div className="actions">{index>0&&<button className="secondary" type="button" onClick={()=>{if(Date.now()-lastMove.current<450)return;lastMove.current=Date.now();setIndex(index-1);setConfirmed(false);}}>前の質問へ</button>}<button className="text-button" type="button" onClick={()=>{if(Date.now()-lastMove.current>=450)onCancel();}}>キャンセル</button></div></fieldset>;
}
