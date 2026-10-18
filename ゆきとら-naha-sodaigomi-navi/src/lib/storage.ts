import {items,unknownItem,type Item} from './data';
import {estimate,initialAnswers,type Answers,type Entry} from './engine';
export const STORAGE_KEY='naha-navi:v1';
export interface Session {entries:Entry[];payment:'ticket'|'cashless';draft:{item:Item;answers:Answers;stage:number;editingKey:string|null}|null;}
function readAnswers(value:unknown):Answers {
 if(!value||typeof value!=='object')throw new Error('Invalid answers');
 const raw=value as Record<string,unknown>;const a={...initialAnswers};
 const enums={weightBand:['under','over','unknown'],volumeBand:['under','over','unknown'],origin:['home','business','unknown'],spring:['yes','no','unknown'],seats:['1','2','unknown'],bag:['yes','no','unknown'],battery:['yes','no','unknown'],limits:['yes','no','unknown']};
 for(const [k,options] of Object.entries(enums)){if(raw[k]!==undefined){if(!options.includes(raw[k] as string))throw new Error('Invalid choice');Object.assign(a,{[k]:raw[k]});}}
 if(!Number.isInteger(raw.quantity)||Number(raw.quantity)<1||Number(raw.quantity)>99)throw new Error('Invalid quantity');a.quantity=Number(raw.quantity);
 for(const k of ['weight','width','depth','height'] as const){if(raw[k]!==undefined&&raw[k]!==null){if(typeof raw[k]!=='number'||!Number.isFinite(raw[k])||raw[k]<=0)throw new Error('Invalid measurement');a[k]=raw[k];}}
 return a;
}
function readItem(raw:{id?:unknown;name?:unknown}){const item=items.find(i=>i.id===raw.id);if(item)return item;if(raw.id==='unknown'&&typeof raw.name==='string'&&raw.name.trim()&&raw.name.length<=100)return unknownItem(raw.name);throw new Error('Unknown item');}
export function encodeSession(s:Session){const pack=(item:Item)=>({id:item.id,name:item.name});return JSON.stringify({version:1,entries:s.entries.map(e=>({key:e.key,item:pack(e.item),answers:e.answers})),payment:s.payment,draft:s.draft?{...s.draft,item:pack(s.draft.item)}:null});}
export function decodeSession(text:string):Session {
 const raw=JSON.parse(text);if(raw.version!==1||!Array.isArray(raw.entries)||raw.entries.length>500)throw new Error('Invalid session');
 if(!['ticket','cashless'].includes(raw.payment))throw new Error('Invalid payment');
 const keys=new Set<string>();const entries:Entry[]=raw.entries.map((e:{key:string;item:{id:unknown;name:unknown};answers:unknown})=>{if(typeof e.key!=='string'||keys.has(e.key))throw new Error('Invalid key');keys.add(e.key);const item=readItem(e.item),answers=readAnswers(e.answers);return {key:e.key,item,answers,result:estimate(item,answers)};});
 let draft:Session['draft']=null;
 if(raw.draft){const d=raw.draft;if(![0,1].includes(d.stage)||(d.editingKey!==null&&!keys.has(d.editingKey)))throw new Error('Invalid draft');draft={item:readItem(d.item),answers:readAnswers(d.answers),stage:d.stage,editingKey:d.editingKey};}
 return {entries,payment:raw.payment,draft};
}
