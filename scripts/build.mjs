import './check.mjs';
import { mkdir, copyFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/', root), { recursive: true });
for (const file of ['index.html', 'preview.html', 'styles.css', 'components.css', 'preview.css', 'app.js', 'data.js', 'components.js', 'preview.js', 'favicon.svg', '.nojekyll']) {
  await copyFile(new URL(file, root), new URL(`dist/${file}`, root));
}
console.log('Static site ready in dist/. No third-party runtime dependencies.');
