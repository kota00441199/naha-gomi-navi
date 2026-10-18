import { lazy, Suspense } from 'react';
const AutoInputPage = lazy(() => import('./AutoInputPage'));
export default function AutoInputRoute() {
  return <Suspense fallback={<p role="status">読み込み中…</p>}><AutoInputPage /></Suspense>;
}
