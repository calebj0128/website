import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const p=(...args)=>path.join(root,...args);
const fixture=p('site','content','posts','temporary-publish-test.json');
const draft=p('site','content','posts','temporary-draft-test.json');
const build=()=>execFileSync(process.execPath, [p('scripts','build.mjs')], {cwd:root,stdio:'pipe'});
try {
  assert(fs.existsSync(p('.pages.yml')), 'Missing .pages.yml at root');
  assert(fs.existsSync(p('site','assets','caleb-flyer.png')), 'Missing flyer');
  build();
  for (const file of ['index.html','writing/index.html','about/index.html','resources/index.html','services/index.html','assets/styles.css','assets/site.js','assets/caleb-flyer.png']) assert(fs.existsSync(p('_site',file)),`Missing ${file}`);
  const empty=fs.readFileSync(p('_site','writing','index.html'),'utf8');
  assert(empty.includes('New writing will appear here.'), 'Empty blog state missing');
  fs.writeFileSync(fixture,JSON.stringify({title:'Test Published Post', date:'2026-11-18', category:'Mental Health', summary:'Sample published article.', published:true, body:'<h2>It works!</h2><p>Sample body with <strong>formatting</strong> and an <a href="https://example.com">external link</a>.</p>'}));
  fs.writeFileSync(draft,JSON.stringify({title:'Test Draft',published:false,body:'<p>Draft should not be public.</p>'}));
  build();
  const archive=fs.readFileSync(p('_site','writing','index.html'),'utf8');
  const article=fs.readFileSync(p('_site','writing','temporary-publish-test','index.html'),'utf8');
  assert(archive.includes('/writing/temporary-publish-test/'),'New article not linked from archive');
  assert(article.includes('<h2>It works!</h2>'),'Blog body missing');
  assert(article.includes('November 18, 2026'),'Post date missing');
  assert(!archive.includes('Test Draft'),'Draft displayed in blog archive');
  assert(!fs.existsSync(p('_site','writing','temporary-draft-test')),'Draft got published');
  console.log('PASS: site pages, assets, blog archive, post generation, formatting, dates, draft hiding.');
} finally {
  for (const f of [fixture,draft]) fs.rmSync(f,{force:true});
  build();
}
