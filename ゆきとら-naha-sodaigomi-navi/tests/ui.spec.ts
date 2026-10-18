import {test,expect,type Page} from '@playwright/test';
const url=process.env.UI_BASE_URL??'http://127.0.0.1:3000';
test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
async function next(page:Page){await page.getByRole('button',{name:'次へ →',exact:true}).tap();}
async function answer(page:Page,text:string){await page.getByRole('radio',{name:text,exact:true}).check();await next(page);}
async function pick(page:Page,name:string){await page.getByLabel('捨てたい品目').fill(name);await page.getByRole('button',{name:'検索する'}).tap();await page.locator('.candidate-grid button').filter({hasText:name}).first().tap();}
async function start(page:Page,n=1){await answer(page,'家庭');await page.getByLabel('数量（点）').fill(String(n));await next(page);}
async function finish(page:Page,editing=false){await expect(page.locator('.answer-review')).toBeVisible();const button=page.getByRole('button',{name:editing?'変更を保存する':'処分方法・料金を見る',exact:true});await expect(button).toBeDisabled();await page.getByLabel('回答を確認しました').check();await button.tap();}
test('スマホで全質問に回答するまで見積もりを表示しない・数値欄なし',async({page})=>{
 await page.goto(url);await pick(page,'電子レンジ');await expect(page.getByRole('button',{name:'次へ →'})).toBeDisabled();await page.keyboard.press('Enter');await expect(page.locator('.results')).toHaveCount(0);
 await start(page,2);await expect(page.getByRole('heading',{name:'概ね50kg以上、または長さ概ね5m以上ですか？'})).toBeVisible();await expect(page.getByRole('button',{name:'次へ →'})).toBeDisabled();await expect(page.locator('.questions input[type=number]')).toHaveCount(0);
 await answer(page,'どちらも未満');await answer(page,'10kg以下');await answer(page,'1m³未満');await expect(page.locator('.results')).toHaveCount(0);await page.keyboard.press('Enter');await expect(page.locator('.results')).toHaveCount(0);await finish(page);
 await expect(page.locator('.summary strong')).toHaveText('600円');await expect(page.getByRole('link',{name:'公式サイトで収集を申し込む'})).toHaveAttribute('href','https://www.naha-sodaigomi.com/receipts/home/');await page.getByLabel('キャッシュレス',{exact:true}).check();await expect(page.locator('.steps')).toContainText('4桁の受付番号・収集日・そ大ごみ');
 await pick(page,'冷蔵庫');await expect(page.locator('.results')).toHaveCount(0);await start(page);await finish(page);await expect(page.locator('.summary strong')).toHaveText('600円');await expect(page.locator('.summary')).toContainText('確認済み分の小計');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('連続タップでもスプリングと人数と収集制限を飛ばさない',async({page})=>{
 await page.goto(url);await pick(page,'ソファー');await start(page);await page.getByRole('radio',{name:'入っている',exact:true}).check();await page.getByRole('button',{name:'次へ →'}).dblclick();await expect(page.getByRole('heading',{name:'何人掛けですか？'})).toBeVisible();await expect(page.getByRole('button',{name:'次へ →'})).toBeDisabled();await expect(page.locator('.results')).toHaveCount(0);
 await answer(page,'1人掛け');await answer(page,'わからない');await finish(page);await expect(page.locator('.summary strong')).toHaveText('1,270円');await expect(page.locator('.collection-status')).toContainText('未確認');await expect(page.getByRole('link',{name:'公式サイトで収集を申し込む'})).toHaveCount(0);
});
test('戻ってスプリングの回答を変更すると必要な質問を追加する',async({page})=>{
 await page.goto(url);await pick(page,'ソファー');await start(page);await answer(page,'入っている');await page.getByRole('button',{name:'前の質問へ'}).tap();await answer(page,'入っていない');await answer(page,'どちらも未満');await answer(page,'入らない');await answer(page,'わからない');await answer(page,'わからない');await finish(page);await expect(page.locator('.price-box')).toContainText('300円〜600円');await expect(page.locator('.summary strong')).toHaveText('金額未確定');
});
test('編集・端末内保存・再読み込み・消去',async({page})=>{
 await page.goto(url);await pick(page,'ソファー');await start(page);await answer(page,'入っている');await answer(page,'1人掛け');await answer(page,'どちらも未満');await finish(page);await page.getByRole('button',{name:'ソファーを編集',exact:true}).tap();await start(page,2);await answer(page,'入っている');await answer(page,'2人掛け以上');await answer(page,'どちらも未満');await finish(page,true);await expect(page.locator('.summary strong')).toHaveText('3,880円');await expect(page.locator('article.result')).toHaveCount(1);
 await page.reload();await expect(page.locator('.summary strong')).toHaveText('3,880円');await page.getByRole('button',{name:'ソファーを編集',exact:true}).tap();await page.getByRole('button',{name:'キャンセル'}).tap();await expect(page.locator('.summary strong')).toHaveText('3,880円');await page.screenshot({path:'test-results/mobile-wizard-result.png',fullPage:true});await page.getByRole('button',{name:'保存データをすべて消去'}).tap();await page.reload();await expect(page.locator('article.result')).toHaveCount(0);
});
test('未登録・曖昧検索・破損した保存データ',async({page})=>{
 await page.goto(url);await page.getByLabel('捨てたい品目').fill('机');await page.getByLabel('捨てたい品目').press('Enter');await expect(page.locator('.candidate-grid button')).toHaveCount(2);
 await page.getByLabel('捨てたい品目').fill('謎の物XYZ');await page.getByRole('button',{name:'検索する'}).tap();await page.getByRole('button',{name:'要確認として追加する'}).tap();await start(page);await finish(page);await expect(page.locator('.summary strong')).toHaveText('金額未確定');
 await page.evaluate(()=>localStorage.setItem('naha-navi:v1','{broken'));await page.reload();await expect(page.getByRole('status')).toContainText('復元できません');
});
test('入力途中から復元しても確認前に見積もりを作らない',async({page})=>{
 await page.goto(url);await pick(page,'ソファー');await start(page);await answer(page,'入っている');await page.reload();await expect(page.locator('.questions')).toBeVisible();await expect(page.getByRole('button',{name:'次へ →'})).toBeDisabled();await expect(page.locator('.results')).toHaveCount(0);await page.screenshot({path:'test-results/mobile-wizard-question.png',fullPage:true});
});
