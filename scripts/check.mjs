import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { styles, kinds, components, resources, globalPrompt, modulePrompt, casePrompt } from '../data.js';
import { componentMarkup } from '../components.js';

const base = new URL('../', import.meta.url);
assert.equal(styles.length, 4);
assert.equal(kinds.length, 8);
assert.equal(components.length, 32);
assert.equal(new Set(components.map(item => item.id)).size, components.length, 'Component IDs must be unique');
for (const style of styles) {
  assert.equal(style.pages.length, 3);
  assert.equal(components.filter(c => c.styleId === style.id).length, 8);
  assert.ok(globalPrompt(style).includes(style.tokens.background));
  assert.ok(casePrompt(style).includes(style.brief));
  assert.ok(style.libraries.every(id => resources.some(resource => resource.id === id)));
  assert.ok(Object.values(style.tokens).every(Boolean));
}
for (const component of components) {
  assert.ok(modulePrompt(component, true).includes('整体'));
  assert.ok(modulePrompt(component).includes(component.name));
  assert.ok(componentMarkup(component).includes(`theme-${component.styleId}`));
  assert.ok(componentMarkup(component, true).length > 100);
}
for (const file of ['index.html', 'preview.html', 'styles.css', 'components.css', 'preview.css', 'app.js', 'data.js', 'components.js', 'preview.js', 'favicon.svg']) await access(new URL(file, base));
for (const file of ['app.js', 'data.js', 'components.js', 'preview.js', 'scripts/build.mjs', 'scripts/serve.mjs']) {
  const result = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(file, base))], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
for (const file of ['index.html', 'preview.html']) {
  const html = await readFile(new URL(file, base), 'utf8');
  assert.ok(html.includes('lang="zh-CN"'));
  assert.ok(html.includes('name="viewport"'));
  for (const [, target] of html.matchAll(/(?:src|href)="\.\/([^"?#]+)/g)) await access(new URL(target, base));
}
console.log('Verified: 4 styles, 12 case pages, 32 component records, prompt coverage, local entry assets, and JavaScript syntax.');
