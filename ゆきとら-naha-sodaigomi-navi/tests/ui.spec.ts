import {test,expect} from '@playwright/test';
test('モバイル検索→質問→料金→複数品目→公式リンク',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto((process.env.UI_BASE_URL??'http://127.0.0.1:3000'));
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
 await page.goto((process.env.UI_BASE_URL??'http://127.0.0.1:3000'));await page.getByLabel('捨てたい品目').fill('机');await page.getByLabel('捨てたい品目').press('Enter');await expect(page.locator('.candidate-grid button')).toHaveCount(2);
 await page.getByLabel('捨てたい品目').fill('未知の機械XYZ');await page.getByRole('button',{name:'検索する'}).click();await expect(page.getByRole('heading',{name:'「未知の機械XYZ」は登録されていません'})).toBeVisible();
 await page.getByRole('button',{name:'要確認として追加する'}).click();await page.getByRole('button',{name:'処分方法・料金を見る'}).click();await expect(page.locator('.summary strong')).toHaveText('金額未確定');
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
test('トップ画面のデスクトップとスマートフォン',async({page})=>{await page.goto((process.env.UI_BASE_URL??'http://127.0.0.1:3000'));for(const width of [390,1280]){await page.setViewportSize({width,height:900});await page.screenshot({path:`test-results/home-${width}.png`,fullPage:true});}});
test('スプリングの質問簡略化、料金と収集可否、編集・復元・消去',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto((process.env.UI_BASE_URL??'http://127.0.0.1:3000'));
 await page.getByRole('button',{name:'ソファー ↗',exact:true}).click();await page.getByRole('button',{name:/ソファー.*選ぶ/}).click();await page.getByRole('button',{name:'次の質問へ'}).click();
 await page.getByLabel('入っている',{exact:true}).check();await page.getByLabel('1人掛け',{exact:true}).check();await expect(page.locator('.measure')).toHaveCount(0);
 await page.reload();await expect(page.getByLabel('1人掛け',{exact:true})).toBeChecked();await expect(page.getByLabel('入っている',{exact:true})).toBeChecked();
 await page.getByRole('button',{name:'処分方法・料金を見る'}).click();await expect(page.locator('.summary strong')).toHaveText('1,270円');await expect(page.locator('.collection-status')).toContainText('収集可否は未確認');await expect(page.getByRole('link',{name:'公式サイトで収集を申し込む'})).toHaveCount(0);
 await page.getByRole('button',{name:'ソファーを編集',exact:true}).click();await page.getByLabel('数量（点）').fill('2');await page.getByRole('button',{name:'次の質問へ'}).click();await page.getByLabel('2人掛け以上',{exact:true}).check();await page.getByLabel('どちらも未満',{exact:true}).check();
 await page.getByRole('button',{name:'変更を保存する'}).click();await expect(page.locator('.summary strong')).toHaveText('3,880円');await expect(page.locator('article.result')).toHaveCount(1);await expect(page.locator('.collection-status')).toContainText('収集対象の見込み');
 await page.reload();await expect(page.locator('.summary strong')).toHaveText('3,880円');await page.getByRole('button',{name:'ソファーを編集',exact:true}).click();await page.getByLabel('数量（点）').fill('3');await page.getByRole('button',{name:'キャンセル'}).click();await expect(page.locator('.summary strong')).toHaveText('3,880円');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/improved-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'保存データをすべて消去'}).click();await page.reload();await expect(page.locator('article.result')).toHaveCount(0);await expect(page.locator('.questions')).toHaveCount(0);
});
test('破損した保存データと保存不可でも画面を利用可能',async({page})=>{await page.goto((process.env.UI_BASE_URL??'http://127.0.0.1:3000'));await page.evaluate(()=>localStorage.setItem('naha-navi:v1','{broken'));await page.reload();await expect(page.getByRole('status')).toContainText('復元できません');await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new Error('unavailable')}});await page.reload();await expect(page.getByRole('status')).toContainText('保存できません');await page.getByRole('button',{name:'冷蔵庫 ↗',exact:true}).click();await expect(page.locator('.candidate-grid')).toContainText('冷蔵庫');});
