'use client';
import { useState } from 'react';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { RULES, SOURCES, CHECKED_ON, canShowRule, type ItemId } from '@/lib/rules';
import { ItemIcon } from './ItemIcon';
export function RuleGuide({ id, origin }: {
    id: ItemId;
    origin: 'ai' | 'manual';
}) {
    const rule = RULES[id];
    const [checked, setChecked] = useState(rule.checks.map(() => false));
    const [show, setShow] = useState(false);
    const ready = canShowRule(id, checked);
    return <div className="rule-guide">
    <p className="small-label">{origin === 'ai' ? 'AIの候補を確認' : '自分で選んだ品目'}</p>
    <div className="selected-item"><span className="item-portrait"><ItemIcon id={id}/></span><h3>{rule.name}</h3></div>
    <fieldset className="confirm-box"><legend>実物を見て確認してください</legend>
      {rule.checks.map((text, index) => <label className="checkbox-row" key={text}>
        <input type="checkbox" checked={checked[index]} onChange={e => {
                setChecked(checked.map((value, n) => n === index ? e.target.checked : value));
                setShow(false);
            }}/><span>{text}</span>
      </label>)}
      <p className="fine">当てはまらない・分からない場合は、チェックせず<a href={SOURCES.dictionary} target="_blank" rel="noreferrer">公式検索</a>へ。</p>
    </fieldset>
    <button type="button" className="button green wide" disabled={!ready} onClick={() => setShow(true)}>分別方法を見る <ArrowRight size={18}/></button>
    {show && ready && <section className="disposal" aria-live="polite">
      <p className="small-label"><Check size={15}/> 那覇市の案内</p><h3>{rule.category}</h3>
      <ol>{rule.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="rule-note">{rule.note}</p>
      <a href={SOURCES.recycling} target="_blank" rel="noreferrer">市の出し方を確認 <ExternalLink size={13}/></a>
      <span className="divider-dot">·</span><a href={SOURCES.dictionary} target="_blank" rel="noreferrer">品目別の根拠 <ExternalLink size={13}/></a>
      <p className="fine">公式資料の確認日 {CHECKED_ON} ／ 回収日・集積場所は<a href={SOURCES.collection} target="_blank" rel="noreferrer">公式案内</a>や建物の管理者に確認してください。</p>
    </section>}
  </div>;
}
