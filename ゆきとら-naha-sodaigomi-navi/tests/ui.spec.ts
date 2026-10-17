import {test,expect} from '@playwright/test';
test('モバイル検索→質問→料金→複数品目→公式リンク',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:3000');
 await expect(page.getByRole('heading',{level:1})).toContainText('これ、どう捨てる');
 await page.getByRole('button',{name:'電子レンジ ↗',exact:true}).click();await page.getByRole('button',{name:/電子レンジ.*選ぶ/}).click();
 await page.getByLabel('数量（点）').fill('2');await page.getByRole('button',{name:'次の質問へ'}).click();
 await page.getByLabel('重量', {exact:false}).fill('10');await page.getByLabel(/^幅/).fill('100');await page.getByLabel(/^奥行き/).fill('100');await page.getByLabel(/^高さ/).fill('99');
 await page.getByRole('button',{name:'処分方法・料金を見る'}).click();
 await expect(page.locator('.summary strong')).toHaveText('600円');
 await expect(page.getByRole('link',{name:'公式サイトで収集を申し込む'})).toHaveAttribute('href','https://www.naha-sodaigomi.com/receipts/home/');
 await page.getByLabel('キャッシュレス',{exact:true}).check();await expect(page.locator('.steps')).toContainText('4桁の受付番号・収集日・そ大ごみ');
 await page.getByRole('button',{name:'別の品目を追加する'}).click();await page.getByLabel('捨てたい品目').fill('冷蔵庫');await page.getByRole('button',{name:'検索する'}).click();await page.getByRole('button',{name:/冷蔵庫.*選ぶ/}).click();await page.getByRole('button',{name:'処分方法・料金を見る'}).click();
 await expect(page.locator('.summary')).toContainText('確認済み分の小計');await expect(page.locator('.summary strong')).toHaveText('600円');await expect(page.getByRole('heading',{name:'家電リサイクルの対象です'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/mobile-results.png',fullPage:true});
});
test('未登録と曖昧検索、キーボード操作、各幅で横溢れなし',async({page})=>{
 await page.goto('http://127.0.0.1:3000');await page.getByLabel('捨てたい品目').fill('机');await page.getByLabel('捨てたい品目').press('Enter');await expect(page.locator('.candidate-grid button')).toHaveCount(2);
 await page.getByLabel('捨てたい品目').fill('未知の機械XYZ');await page.getByRole('button',{name:'検索する'}).click();await expect(page.getByRole('heading',{name:'「未知の機械XYZ」は登録されていません'})).toBeVisible();
 await page.getByRole('button',{name:'要確認として追加する'}).click();await page.getByRole('button',{name:'処分方法・料金を見る'}).click();await expect(page.locator('.summary strong')).toHaveText('金額未確定');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
test('トップ画面のデスクトップとスマートフォン',async({page})=>{await page.goto('http://127.0.0.1:3000');for(const width of [390,1280]){await page.setViewportSize({width,height:900});await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});}});
