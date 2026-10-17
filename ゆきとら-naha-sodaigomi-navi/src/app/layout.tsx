import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'那覇 粗大ごみナビ｜捨て方と料金を、ひとつずつ。',description:'那覇市の家庭向け粗大ごみの分別・料金・申し込みを案内する非公式サービス。'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}
