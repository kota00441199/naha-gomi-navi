import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
export const out = path.resolve('.sites-runtime/check');
const files = ['lib/upload.ts','lib/quota.ts','lib/rules.ts','lib/classification.ts','lib/classify-prompt.ts','lib/analyze.ts','lib/prepare-photo.ts','components/ItemIcon.tsx','components/PhotoInput.tsx','components/RuleGuide.tsx','app/page.tsx'];
for (const file of files) {
  const text = (await fs.readFile(file,'utf8')).replace(/from (['"])([^'"]+)\1/g, (all,q,spec) => {
    if (!spec.startsWith('.') && !spec.startsWith('@/')) return all;
    let relative = spec.startsWith('@/') ? path.posix.relative(path.posix.dirname(file),spec.slice(2)) : spec;
    if(!relative.startsWith('.')) relative='./'+relative;
    return `from ${q}${relative}.mjs${q}`;
  });
  const target=path.join(out,file.replace(/\.tsx?$/,'.mjs'));
  await fs.mkdir(path.dirname(target),{recursive:true});
  await fs.writeFile(target,ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText);
}
export async function load(file){return import(pathToFileURL(path.join(out,file+'.mjs')));}
