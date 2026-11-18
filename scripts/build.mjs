import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'site');
const DIST = path.join(ROOT, '_site');
const POSTS = path.join(SRC, 'content', 'posts');
const escapeHTML = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const stripHTML = s => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const slugify = name => String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'article';
const dateText = date => {
  if (!date) return '';
  const match = String(date).match(/^\d{4}-\d{2}-\d{2}/);
  if (!match) throw new Error(`Invalid publication date: ${date}`);
  const d = new Date(match[0] + 'T12:00:00Z');
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid publication date: ${date}`);
  return d.toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'});
};

// Keep the original website pages and all of their styles and local images.
fs.rmSync(DIST, {recursive:true, force:true});
fs.mkdirSync(DIST, {recursive:true});
for (const name of ['index.html', 'about', 'services', 'resources', 'assets']) {
  fs.cpSync(path.join(SRC,name), path.join(DIST,name), {recursive:true});
}

const fileNames = fs.readdirSync(POSTS).filter(name => name.endsWith('.json'));
const published = [];
const used = new Set();
for (const fileName of fileNames) {
  const filePath = path.join(POSTS, fileName);
  let post;
  try {post = JSON.parse(fs.readFileSync(filePath, 'utf8'));}
  catch(e) {throw new Error(`Could not read blog post ${fileName}: ${e.message}`);}
  if (post.published !== true) continue;
  if (typeof post.title !== 'string' || !post.title.trim()) throw new Error(`Published post ${fileName} needs a title`);
  const slug = slugify(path.basename(fileName, '.json'));
  if (used.has(slug)) throw new Error(`Duplicate URL slug: ${slug}`);
  used.add(slug);
  const body = typeof post.body === 'string' ? post.body : '';
  const title = post.title.trim();
  const summary = typeof post.summary === 'string' ? post.summary.trim() : '';
  const category = typeof post.category === 'string' && post.category ? post.category : 'Essay';
  const date = post.date ? dateText(post.date) : '';
  const url = `/writing/${slug}/`;
  const template = fs.readFileSync(path.join(SRC, 'writing', 'post.template.html'), 'utf8');
  let html = template.replaceAll('%%TITLE%%',escapeHTML(title)).replaceAll('%%CATEGORY%%',escapeHTML(category))
    .replaceAll('%%SUMMARY%%',escapeHTML(summary)).replaceAll('%%DATE%%',escapeHTML(date)).replaceAll('%%BODY%%',body);
  if (!summary) html = html.replace(/<p class="lead" data-optional="summary">[^<]*<\/p>/,'');
  if (!date) html = html.replace(/<p class="post-meta" data-optional="date">[^<]*<\/p>/,'');
  const folder = path.join(DIST, 'writing', slug);
  fs.mkdirSync(folder, {recursive:true});
  fs.writeFileSync(path.join(folder,'index.html'), html);
  published.push({title, summary, category, date, url, dateSort: post.date ? new Date(String(post.date).slice(0,10)+'T12:00:00Z').getTime() : 0});
}

published.sort((a,b) => b.dateSort-a.dateSort || a.title.localeCompare(b.title));
const cards = published.length ? published.map(post => `<a class="post-card" href="${post.url}"><span class="eyebrow">${escapeHTML(post.category)}</span><h2>${escapeHTML(post.title)}</h2>${post.date ? `<span class="post-meta">${escapeHTML(post.date)}</span>` : ''}${post.summary ? `<p>${escapeHTML(post.summary)}</p>` : ''}<span class="post-card-bottom">Read article ↗</span></a>`).join('\n') : `<div class="empty-state"><span class="eyebrow">COMING SOON</span><h2>New writing will appear here.</h2><p>Essays and reflections will be published here as they become available. You can also follow the work on <a href="https://substack.com/@calebjoslin">Substack</a>.</p></div>`;
const archiveTemplate = fs.readFileSync(path.join(SRC, 'writing', 'archive.template.html'), 'utf8');
if (!archiveTemplate.includes('<!-- BLOG_CARDS -->')) throw new Error('Blog archive template missing marker');
const archive = archiveTemplate.replace('<!-- BLOG_CARDS -->',cards);
fs.mkdirSync(path.join(DIST,'writing'), {recursive:true});
fs.writeFileSync(path.join(DIST, 'writing', 'index.html'), archive);
console.log(`Built site at _site/ (${published.length} published post${published.length===1?'':'s'}).`);
