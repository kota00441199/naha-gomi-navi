'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main role="alert"><div className="card"><h1>案内を読み込めませんでした</h1><p>通信環境を確認して、もう一度お試しください。公式受付でも確認できます。</p><button className="primary" onClick={reset}>もう一度読み込む</button><p><a href="https://www.naha-sodaigomi.com/receipts/home/">公式受付へ</a></p><a href="tel:0988893567">098-889-3567</a></div></main>}
