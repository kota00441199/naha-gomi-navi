'use client';

import {useEffect,useState} from 'react';
import AutomationPanel from './automation-panel';
import type {Entry} from '@/lib/engine';

const STORAGE_KEY='naha-sodaigomi-navi-state-v1';

export default function AutoInputPage(){
 const [entries,setEntries]=useState<Entry[]>([]);

 useEffect(()=>{
  try{
   const raw=localStorage.getItem(STORAGE_KEY);
   if(!raw)return;
   const saved=JSON.parse(raw) as {entries?:Entry[]};
   if(Array.isArray(saved.entries))setEntries(saved.entries);
  }catch{
   // 自動入力ページの手動設定はそのまま利用できるようにする。
  }
 },[]);

 return <>
  <a href="#main" className="skip">本文へ移動</a>
  <header><a href="/" className="brand"><span className="logo" aria-hidden="true">↗</span><span>那覇 <b>粗大ごみナビ</b><small>公式申込の自動入力</small></span></a><div className="header-meta"><span className="area">対応地域：那覇市</span><span className="pill">試験版</span></div></header>
  <main id="main"><section className="card auto-input-hero"><p className="eyebrow">OFFICIAL APPLICATION ASSIST</p><h1>公式申込の<br/><span>自動入力</span></h1><p className="muted">保存した住所・品目を那覇市公式受付へ転記します。メール認証、内容確認、最終申込・支払いは本人が行います。</p><a className="text-button" href="/">← 品目検索へ戻る</a></section><AutomationPanel entries={entries}/></main>
  <footer><b>那覇 粗大ごみナビ</b><p>公式受付の内容を確認してから、本人が申込みを確定してください。</p><a href="/">トップへ戻る</a></footer>
 </>;
}
