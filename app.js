import { styles, kinds, components, resources, getStyle, getKind, getComponent, globalPrompt, modulePrompt, casePrompt } from './data.js';
import { componentMarkup, componentDocument, escapeHTML as esc } from './components.js';

const icons = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Z"/><path d="m2 12 10 5 10-5M2 16l10 5 10-5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
  link: '<path d="m10 14 4-4m-6 6-2 2a4.2 4.2 0 0 1-6-6l4-4a4.2 4.2 0 0 1 6 0m4 0 2-2a4.2 4.2 0 0 1 6 6l-4 4a4.2 4.2 0 0 1-6 0" transform="translate(2 0) scale(.85)"/>',
  book: '<path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3Z"/><path d="M12 6v15"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-3c3 0 6-1 6-6a5 5 0 0 0-1-3c.3-1 .3-2-.2-3 0 0-1-.3-3 1a12 12 0 0 0-7 0C7 2.7 6 3 6 3c-.5 1-.5 2-.2 3a5 5 0 0 0-1 3c0 5 3 6 6 6a3.5 3.5 0 0 0-1 3v4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/>',
  pointer: '<path d="m5 3 14 9-7 1-3 7Z"/>',
  square: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/>',
  chart: '<path d="M3 3v18h18M7 16v-5m5 5V7m5 9V4"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M10 3v18"/>',
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.square}</svg>`; }
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const main = document.getElementById('main');
const validFavorite = id => typeof id === 'string' && (id.startsWith('case:') ? !!getStyle(id.slice(5)) : id.startsWith('component:') && !!getComponent(id.slice(10)));
let favorites;
try { const saved = JSON.parse(localStorage.getItem('design-atlas-favorites') || '[]'); favorites = new Set(Array.isArray(saved) ? saved.filter(validFavorite) : []); } catch { favorites = new Set(); }
let filter = { q: '', style: 'all', kind: 'all', scene: 'all' };
let current = 'explore', prompts = new Map(), toastTimer;
const labels = { explore: '探索图鉴', components: '通用组件', cases: '完整案例', favorites: '我的收藏', resources: '设计资源', guide: '使用指南', case: '案例详情', component: '组件详情' };
const pill = text => `<span class="tag">${esc(text)}</span>`;
const swatches = style => `<div class="swatches" aria-label="${style.name} 配色">${style.palette.map(color => `<span style="background:${color}" title="${color}"></span>`).join('')}</div>`;
function saveButton(id, text = false) { const saved = favorites.has(id); return `<button class="${text ? 'button button-light' : 'save-button'} ${saved ? 'is-saved' : ''}" data-save="${id}" aria-pressed="${saved}" aria-label="${saved ? '取消收藏' : '收藏'}${esc(id.startsWith('case:') ? getStyle(id.slice(5)).name : getComponent(id.slice(10)).name)}">${icon('bookmark')}${text ? saved ? '已收藏' : '收藏设计' : ''}</button>`; }
function caseCard(style) {
  return `<article class="case-card"><div class="case-cover theme-${style.id}"><a href="#case/${style.id}" aria-label="查看 ${style.name} 完整案例"><iframe src="./preview.html?style=${style.id}&thumb=1" title="${style.name} 案例缩略图" loading="lazy" tabindex="-1" aria-hidden="true"></iframe><span class="cover-open">探索案例 ↗</span></a>${saveButton(`case:${style.id}`)}<span class="cover-label">${style.english}</span></div><div class="case-meta"><div><span class="card-overline">${style.style} <span>／</span> ${style.scene}</span><h3><a href="#case/${style.id}">${style.name}<span>↗</span></a></h3><p>${style.summary}</p></div>${swatches(style)}</div><div class="case-bottom"><span>3 个页面 <b>·</b> 8 个组件 <b>·</b> 分层 Prompt</span><span>原创案例</span></div></article>`;
}
function componentCard(component) {
  const style = getStyle(component.styleId), kind = getKind(component.kindId);
  return `<article class="component-card"><div class="component-cover"><a href="#component/${component.id}" aria-label="查看 ${component.name}"><div class="component-mini">${componentMarkup(component)}</div></a>${saveButton(`component:${component.id}`)}</div><div class="component-meta"><div><span class="card-overline">${kind.english} <span>／</span> ${style.style}</span><h3><a href="#component/${component.id}">${component.name}</a></h3></div><a class="component-next" href="#component/${component.id}" aria-label="查看 ${component.name} 详情">↗</a></div></article>`;
}
function sectionHead(eyebrow, title, description, more = '') { return `<div class="section-head"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${description ? `<p>${description}</p>` : ''}</div>${more}</div>`; }
function pageHead(eyebrow, title, desc) { return `<div class="page-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${desc}</p></div>`; }
function home() {
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="green-dot"></span> YOUR PERSONAL DESIGN ATLAS <span class="volume">VOL. 01</span></p><h1>把好设计，<br>留给<span>下一个项目。</span><i>✳</i></h1><p>从一个按钮，到一整个项目。<br>收藏喜欢的界面，也收藏它背后的设计方法。</p><div class="hero-actions"><a class="button button-primary" href="#cases">找一个设计方向 ${icon('arrow')}</a><a class="hero-secondary" href="#components">从组件开始 ↗</a></div><div class="hero-stats"><span><strong>04</strong>完整设计案例</span><span><strong>32</strong>可复用组件</span><span><strong>03</strong>层设计提示词</span></div></div><div class="hero-art" aria-hidden="true"><div class="art-caption">A SMALL LIBRARY OF GOOD IDEAS.</div><div class="art-paper"><span>DESIGN NOTES — 001</span><p>Less searching.<br><em>More creating.</em></p><div class="art-lines"><i></i><i></i><i></i></div><b>↗</b></div><div class="art-green"><span>✳</span><small>MAKE ROOM<br>FOR GOOD DESIGN.</small></div><div class="art-palette"><span>THE PALETTE</span><div><i></i><i></i><i></i><i></i></div></div><span class="art-index">COLLECT / CONNECT / CREATE</span></div></section><section class="home-section">${sectionHead('CURATED CASE STUDIES', '先选一套，喜欢的设计。', '完整页面、设计规则与提示词，放在同一个地方。', '<a class="text-link" href="#cases">全部案例 ↗</a>')}<div class="case-grid">${styles.map(caseCard).join('')}</div></section><section class="home-section">${sectionHead('SMALL PIECES, MANY POSSIBILITIES', '从一个小组件开始。', '按类型挑选，带着风格复用。', '<a class="text-link" href="#components">浏览 32 个组件 ↗</a>')}<div class="kind-grid">${kinds.map(kind => `<a href="#components?kind=${kind.id}"><span>${icon(kind.icon)}</span><strong>${kind.name}</strong><small>04 种设计方向</small><b>↗</b></a>`).join('')}</div></section><section class="workflow-banner"><span class="workflow-symbol">✳</span><div><p class="eyebrow">FROM INSPIRATION TO IMPLEMENTATION</p><h2>带走效果，也带走方法。</h2><p>选风格 → 看案例 → 拆组件 → 复制 Prompt → 开始创造</p></div><a href="#guide" class="button button-light">查看使用指南 ↗</a></section>`;
}
function filterBar(view) {
  return `<div class="filter-panel"><div class="filter-top"><label class="search-box">${icon('search')}<input type="search" id="search" placeholder="搜索名称、风格、使用场景…" aria-label="搜索设计" value="${esc(filter.q)}"><kbd>/</kbd></label>${view === 'components' ? `<label class="select-label">类型<select id="kind-filter"><option value="all">全部组件</option>${kinds.map(kind => `<option value="${kind.id}" ${filter.kind === kind.id ? 'selected' : ''}>${kind.name}</option>`).join('')}</select></label>` : ''}<label class="select-label">场景<select id="scene-filter"><option value="all">全部场景</option>${styles.map(style => `<option value="${style.id}" ${filter.scene === style.id ? 'selected' : ''}>${style.scene}</option>`).join('')}</select></label></div><div class="style-filters"><span>设计风格</span><button data-style="all" aria-pressed="${filter.style === 'all'}" class="filter-chip ${filter.style === 'all' ? 'selected' : ''}">全部</button>${styles.map(style => `<button data-style="${style.id}" aria-pressed="${filter.style === style.id}" class="filter-chip ${filter.style === style.id ? 'selected' : ''}"><i style="background:${style.tokens.accent}"></i>${style.style}</button>`).join('')}<button class="reset-filters" data-reset>重置筛选 ↺</button></div></div>`;
}
function matches(style, component = null) {
  const haystack = `${style.name} ${style.subtitle} ${style.tags.join(' ')} ${style.summary} ${component ? component.name + ' ' + getKind(component.kindId).name + ' ' + getKind(component.kindId).context : ''}`.toLowerCase();
  return (filter.style === 'all' || style.id === filter.style) && (filter.scene === 'all' || style.id === filter.scene) && (!component || filter.kind === 'all' || component.kindId === filter.kind) && (!filter.q || haystack.includes(filter.q.toLowerCase().trim()));
}
function listingContent() {
  let chosenCases = current === 'components' ? [] : styles.filter(style => matches(style) && (current !== 'favorites' || favorites.has(`case:${style.id}`)));
  let chosenComponents = current === 'cases' ? [] : components.filter(component => matches(getStyle(component.styleId), component) && (current !== 'favorites' || favorites.has(`component:${component.id}`)));
  const count = chosenCases.length + chosenComponents.length;
  return `<div class="result-heading"><span>${current === 'favorites' ? '收藏的设计' : current === 'cases' ? '完整案例' : '全部组件'} <strong>${String(count).padStart(2, '0')}</strong></span><span>${current === 'favorites' ? '保存在此浏览器中' : '每个设计，都有一套可带走的方法'}</span></div>${count === 0 ? `<div class="empty-state"><span>✳</span><h2>${current === 'favorites' && !favorites.size ? '为喜欢的设计，留一个位置。' : '暂时没有匹配的设计。'}</h2><p>${current === 'favorites' && !favorites.size ? '点击案例或组件右上角的书签，下一次就能在这里找到。' : '试试更短的关键词，或重置筛选后重新寻找。'}</p><a class="button button-primary" href="#explore">探索图鉴 ↗</a><button class="button button-light" data-reset>重置筛选</button></div>` : `${chosenCases.length ? `<div class="case-grid">${chosenCases.map(caseCard).join('')}</div>` : ''}${chosenCases.length && chosenComponents.length ? '<h2 class="saved-subhead">收藏的组件</h2>' : ''}${chosenComponents.length ? `<div class="component-grid">${chosenComponents.map(componentCard).join('')}</div>` : ''}`}`;
}
function listing(view) {
  const info = { cases: ['COMPLETE DESIGN STORIES', '完整案例', '从全局设计理念，到每一个具体模块。选一套适合你的项目。'], components: ['A LIBRARY OF BUILDING BLOCKS', '通用组件', '同一种组件，不同的设计表达。找到那个刚刚好的。'], favorites: ['YOUR PERSONAL SHORTLIST', '我的收藏', '把喜欢的设计放在一起，下次从这里开始。收藏保存在当前浏览器，可导出备份。'] }[view];
  return `${pageHead(...info)}${view === 'favorites' ? '<div class="collection-tools"><button class="button button-light" data-export-favorites>导出收藏 JSON ↗</button><label class="button button-light">导入收藏<input id="import-favorites" type="file" accept="application/json,.json" hidden></label></div>' : ''}${filterBar(view)}<div id="results" aria-live="polite">${listingContent()}</div>`;
}
function promptBlock(key, title, body, description = '', open = false) {
  prompts.set(key, body);
  return `<details class="prompt-block" ${open ? 'open' : ''}><summary><span><small>PROMPT</small>${title}</span><span class="details-plus">＋</span></summary><div class="prompt-body">${description ? `<p>${description}</p>` : ''}<pre>${esc(body)}</pre><button class="button button-primary" data-copy="${key}">${icon('copy')} 复制提示词</button></div></details>`;
}
function resourceLinks(ids) { return resources.filter(resource => ids.includes(resource.id)).map(resource => `<a class="resource-row" href="${resource.url}" target="_blank" rel="noopener noreferrer"><span class="resource-mark">${resource.mark}</span><div><strong>${resource.name}</strong><p>${resource.use}</p></div><span>↗</span></a>`).join(''); }
function tokensBlock(style) { return `<div class="token-layout"><div class="palette-large">${style.palette.map(color => `<button data-color="${color}" aria-label="复制颜色 ${color}"><i style="background:${color}"></i><span>${color}</span></button>`).join('')}</div><dl class="token-list">${Object.entries(style.tokens).map(([key, value]) => `<div><dt>${key}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></div>`; }
function caseDetail(style) {
  return `<a href="#cases" class="back-link">← 返回完整案例</a><div class="detail-heading"><div><p class="eyebrow">${style.english} <span> / 原创演示案例</span></p><h1>${style.name}<span>${style.subtitle}</span></h1><p>${style.description}</p><div class="tags">${style.tags.map(pill).join('')}</div></div><div class="detail-actions">${saveButton(`case:${style.id}`, true)}<button class="button button-primary" data-copy="case-full">${icon('copy')} 复制完整项目 Prompt</button><button class="button button-light" data-export-case="${style.id}">导出设计方案 ↓</button></div></div><section class="preview-section"><div class="preview-toolbar"><div><span class="preview-dot"></span><strong>实时案例预览</strong><span class="muted">3 个页面 · 可交互演示</span></div><div><label class="sr-only" for="preview-page">预览页面</label><select id="preview-page">${style.pages.map(page => `<option value="${page.id}">${page.name}</option>`).join('')}</select><div class="device-controls" aria-label="预览尺寸"><button data-device="desktop" aria-pressed="true">桌面</button><button data-device="tablet" aria-pressed="false">平板</button><button data-device="mobile" aria-pressed="false">手机</button></div><a class="icon-button" id="preview-newtab" href="./preview.html?style=${style.id}" target="_blank" rel="noopener noreferrer" aria-label="在新标签页打开案例">↗</a></div></div><div class="preview-stage"><iframe id="case-preview" data-style="${style.id}" src="./preview.html?style=${style.id}" title="${style.name} 完整交互案例"></iframe></div><p class="preview-notice">${style.notes}</p></section><div class="detail-columns"><div><section class="detail-section"><p class="eyebrow">01 / DESIGN DIRECTION</p><h2>这套设计，为什么这样做。</h2><p>${style.principle}</p><ul class="rule-list">${style.rules.map(rule => `<li>${rule}</li>`).join('')}</ul></section><section class="detail-section"><p class="eyebrow">02 / DESIGN TOKENS</p><h2>把风格变成明确的规则。</h2>${tokensBlock(style)}</section><section class="detail-section"><p class="eyebrow">03 / PROMPT LIBRARY</p><h2>从整体，到一个具体页面。</h2>${promptBlock('case-full', '完整项目提示词', casePrompt(style), '包含设计理念、设计变量、页面结构、模块与交互要求。', true)}${promptBlock('case-global', '整体设计理念', globalPrompt(style), '在已有项目中应用这套风格时，先提供这份总规则。')}${style.pages.map(page => promptBlock(`page-${page.id}`, `${page.name} · 页面提示词`, `${globalPrompt(style)}\n\n页面任务：${style.name} · ${page.name}\n具体结构：${page.detail}\n项目背景：${style.brief}\n\n请遵守整体风格，提供完整页面布局与必要交互，确保桌面、平板与手机可用。所有示例数据明确标注。`)).join('')}</section></div><aside class="detail-aside"><section><p class="eyebrow">THE COMPLETE PICTURE</p><h3>页面与模块</h3><div class="page-outline">${style.pages.map((page, i) => `<div><span>0${i + 1}</span><div><strong>${page.name}</strong><p>${page.detail}</p></div></div>`).join('')}</div><div class="tags">${style.modules.map(pill).join('')}</div></section><section><p class="eyebrow">IMPLEMENTATION REFERENCES</p><h3>可选 UI 库参考</h3><p class="small-note">本站案例使用原生 HTML/CSS。下面链接用于你在项目中选型和实现时参考。</p>${resourceLinks(style.libraries)}</section></aside></div><section class="detail-section">${sectionHead('04 / REUSABLE COMPONENTS', '拆开来看，也能单独使用。', '每个组件都有设计介绍、独立预览与可复制的提示词。')}<div class="component-grid">${components.filter(component => component.styleId === style.id).map(componentCard).join('')}</div></section>`;
}
function componentDetail(component) {
  const style = getStyle(component.styleId), kind = getKind(component.kindId);
  return `<a href="#components" class="back-link">← 返回通用组件</a><div class="detail-heading"><div><p class="eyebrow">${kind.english} / ${style.english}</p><h1>${component.name}</h1><p>${component.description}</p><div class="tags">${[kind.name, style.style, style.scene].map(pill).join('')}</div></div><div class="detail-actions">${saveButton(`component:${component.id}`, true)}<button class="button button-primary" data-copy="module-combined">${icon('copy')} 复制含整体风格的 Prompt</button><button class="button button-light" data-export-component="${component.id}">下载 HTML 示例 ↓</button></div></div><div class="detail-columns component-detail-columns"><div><section class="live-component"><div class="live-component-label"><span>LIVE COMPONENT</span><span>可以点击、输入和体验状态</span></div>${componentMarkup(component, true)}</section><section class="detail-section"><p class="eyebrow">DESIGN NOTES</p><h2>适合在哪里，怎么使用。</h2><p>${kind.context}。</p><p>${kind.requirement}</p><p>${style.principle}</p></section><section class="detail-section"><h2>带着风格，一起复用。</h2>${promptBlock('module-combined', '模块＋整体设计理念', modulePrompt(component, true), '独立生成组件时使用，保持配色、字体与交互规则一致。', true)}${promptBlock('module-only', '只复制模块提示词', modulePrompt(component), '项目已经有全局设计上下文时使用。')}</section></div><aside class="detail-aside"><section><p class="eyebrow">PART OF A BIGGER STORY</p><h3>所属完整案例</h3><a class="parent-case" href="#case/${style.id}"><span class="parent-star theme-${style.id}" style="background:${style.tokens.background};color:${style.tokens.accent}">✳</span><div><strong>${style.name} ↗</strong><p>${style.subtitle}</p></div></a><p class="small-note">看看这个组件如何放进一个真实的页面结构里。</p></section><section><p class="eyebrow">STYLE AT A GLANCE</p><h3>设计变量</h3>${tokensBlock(style)}</section><section><h3>实现参考</h3>${resourceLinks(style.libraries)}</section></aside></div><section class="detail-section">${sectionHead('SAME COMPONENT, DIFFERENT EXPRESSION', '换一个风格，再看看。', '')}<div class="component-grid">${components.filter(item => item.kindId === component.kindId && item.id !== component.id).map(componentCard).join('')}</div></section>`;
}
function resourcesPage() { return `${pageHead('TOOLS BEHIND THE INTERFACE', '设计资源', '从选定风格到实现界面，找到合适的参考工具。')}<p class="resource-intro">这里收录的是官方文档与组件资源。图鉴中的页面与组件为本站原创的原生 HTML/CSS 演示，资源链接表示可选实现参考。</p><div class="resources-grid">${resources.map(resource => `<article class="resource-card"><span class="resource-mark">${resource.mark}</span><p class="eyebrow">${resource.label}</p><h2>${resource.name}</h2><p>${resource.description}</p><p>${resource.use}</p><a class="button button-light" href="${resource.url}" target="_blank" rel="noopener noreferrer">打开官方文档 ↗</a></article>`).join('')}</div><section class="resource-method"><h2>把工具放在设计之后。</h2><p>先在案例中选择视觉方向，确认字体、色彩、布局和交互，再判断现有技术栈适合哪种组件工具。复制提示词时，附上自己的技术栈与已有组件约定。</p><a href="#cases" class="text-link">回到案例，寻找设计方向 ↗</a></section>`; }
function guidePage() { return `${pageHead('A PRACTICAL WAY TO START', '从一次喜欢，到下一次使用。', '用五个简单步骤，把图鉴变成项目的起点。')}<div class="guide-steps">${[
  ['先找一个方向', '从完整案例入手，根据项目类型与设计风格筛选。先看完整页面，再决定这种风格是否适合你的内容。', '#cases', '浏览完整案例'],
  ['理解它的设计规则', '打开案例详情，查看设计理念、配色、字体、间距和组件规则。留意页面结构与需要补齐的业务功能。', '#case/folio', '查看示例设计规则'],
  ['带走合适层级的提示词', '新项目复制完整项目 Prompt；沿用现有页面结构时复制整体设计理念；只增加局部模块时复制组件 Prompt。组件单独生成时带上全局风格。', '#component/folio-button', '查看模块 Prompt'],
  ['换成自己的项目上下文', '提供真实的项目名称、目标用户、页面内容、技术栈和功能边界。把演示数据替换为真实内容，再用手机与键盘走一遍关键流程。', '#resources', '查找实现参考'],
  ['留下下次会用到的设计', '点击书签收藏案例或组件。收藏只保存在当前浏览器；在“我的收藏”中导出 JSON 进行备份，之后可重新导入。', '#favorites', '打开我的收藏'],
].map(([title, description, href, cta], index) => `<article><span class="step-number">0${index + 1}</span><div><h2>${title}</h2><p>${description}</p><a class="text-link" href="${href}">${cta} ↗</a></div></article>`).join('')}</div><div class="guide-note"><h2>给 AI 的项目上下文示例</h2><p>“我要开发一个面向独立研究者的个人主页，使用 Astro，包含首页、研究项目、文章目录与联系页。请沿用 Morrow 的设计理念，将案例中的演示作品替换为我的项目资料；不要生成未经提供的成果或用户评价。”</p><p>当前版本包含四套原创案例、每套三个演示页面与八类组件。表单、工作区和购物袋交互仅用于本地演示。你可以下载组件 HTML、导出案例 Markdown，并在源代码中持续增加设计条目。</p></div>`; }

const coverObserver = new ResizeObserver(entries => entries.forEach(entry => entry.target.style.setProperty('--cover-scale', entry.contentRect.width / 1000)));
function observeCovers() { coverObserver.disconnect(); document.querySelectorAll('.case-cover').forEach(el => coverObserver.observe(el)); }
function refreshResults() { document.getElementById('results').innerHTML = listingContent(); observeCovers(); document.querySelectorAll('[data-style]').forEach(el => { if (el.matches('button')) { const active = el.dataset.style === filter.style; el.classList.toggle('selected', active); el.setAttribute('aria-pressed', String(active)); } }); }
function render() {
  const [path, query = ''] = location.hash.slice(1).split('?');
  const [view = 'explore', id] = (path || 'explore').split('/');
  current = labels[view] ? view : 'explore'; prompts = new Map();
  if (['components', 'cases', 'favorites'].includes(current)) { const p = new URLSearchParams(query); filter = { q: p.get('q') || '', style: styles.some(s => s.id === p.get('style')) ? p.get('style') : 'all', kind: kinds.some(k => k.id === p.get('kind')) ? p.get('kind') : 'all', scene: 'all' }; }
  let content;
  if (current === 'case' && getStyle(id)) content = caseDetail(getStyle(id));
  else if (current === 'component' && getComponent(id)) content = componentDetail(getComponent(id));
  else if (['components', 'cases', 'favorites'].includes(current)) content = listing(current);
  else if (current === 'resources') content = resourcesPage();
  else if (current === 'guide') content = guidePage();
  else if (current === 'case' || current === 'component') content = `${pageHead('DESIGN NOT FOUND', '还没有收录这个设计。', '链接可能已变更，回到图鉴找找其他设计。')}<a href="#explore" class="button button-primary">回到图鉴 ↗</a>`;
  else content = home();
  main.innerHTML = content;
  document.getElementById('breadcrumb').textContent = labels[current];
  document.title = `${current === 'case' && getStyle(id) ? getStyle(id).name : current === 'component' && getComponent(id) ? getComponent(id).name : labels[current]} · UI Design Atlas`;
  document.querySelectorAll('[data-nav]').forEach(el => { const active = el.dataset.nav === (current === 'case' ? 'cases' : current === 'component' ? 'components' : current); el.classList.toggle('active', active); if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
  document.getElementById('favorite-count').textContent = favorites.size;
  closeMenu(); observeCovers(); window.scrollTo(0, 0);
}
function notify(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3300); }
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); notify('已复制，带去你的下一个项目。'); }
  catch { const input = document.getElementById('fallback-text'); input.value = text; document.getElementById('copy-fallback').showModal(); input.focus(); input.select(); }
}
function download(text, filename, type) { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function persistFavorites() { try { localStorage.setItem('design-atlas-favorites', JSON.stringify([...favorites])); } catch { notify('收藏已暂存在本次会话；浏览器未允许持久保存，请导出备份。'); } }
function closeMenu() { document.body.classList.remove('menu-open'); document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false'); }
document.addEventListener('click', async event => {
  const save = event.target.closest('[data-save]');
  if (save) {
    const id = save.dataset.save; favorites.has(id) ? favorites.delete(id) : favorites.add(id); persistFavorites();
    document.querySelectorAll('[data-save]').forEach(button => { if (button.dataset.save === id) { const holder = document.createElement('div'); holder.innerHTML = saveButton(id, button.classList.contains('button')); button.replaceWith(holder.firstElementChild); } });
    document.getElementById('favorite-count').textContent = favorites.size;
    if (current === 'favorites') refreshResults(); return;
  }
  const copy = event.target.closest('[data-copy]'); if (copy) { await copyText(prompts.get(copy.dataset.copy) || ''); return; }
  const color = event.target.closest('[data-color]'); if (color) { await copyText(color.dataset.color); return; }
  const style = event.target.closest('button[data-style]'); if (style) { filter.style = style.dataset.style; refreshResults(); return; }
  if (event.target.closest('[data-reset]')) { filter = { q: '', style: 'all', kind: 'all', scene: 'all' }; document.getElementById('search').value = ''; const kind = document.getElementById('kind-filter'); if (kind) kind.value = 'all'; document.getElementById('scene-filter').value = 'all'; refreshResults(); return; }
  const device = event.target.closest('[data-device]'); if (device) { const widths = { desktop: '100%', tablet: '768px', mobile: '375px' }; document.getElementById('case-preview').style.width = widths[device.dataset.device]; document.querySelectorAll('[data-device]').forEach(el => el.setAttribute('aria-pressed', String(el === device))); return; }
  const openDialog = event.target.closest('[data-open-dialog]'); if (openDialog) { document.getElementById(openDialog.dataset.openDialog).showModal(); return; }
  if (event.target.closest('[data-demo-action]')) { event.preventDefault(); notify('已触发演示操作，可替换为你项目中的业务逻辑。'); return; }
  const exportCase = event.target.closest('[data-export-case]'); if (exportCase) { const style = getStyle(exportCase.dataset.exportCase); download(`# ${style.name} · ${style.subtitle}\n\n${style.description}\n\n## 完整项目提示词\n\n${casePrompt(style)}\n\n## 模块提示词\n\n${components.filter(c => c.styleId === style.id).map(c => `### ${c.name}\n\n${modulePrompt(c)}`).join('\n\n')}\n\n## 实现参考\n\n${resources.filter(r => style.libraries.includes(r.id)).map(r => `- [${r.name}](${r.url})：${r.use}`).join('\n')}\n\n${style.notes}\n\n来源：UI Design Atlas · https://github.com/Xiiiing/ui-design-atlas\n`, `${style.id}-design-brief.md`, 'text/markdown;charset=utf-8'); return; }
  const exportComponent = event.target.closest('[data-export-component]'); if (exportComponent) { try { download(await componentDocument(getComponent(exportComponent.dataset.exportComponent)), `${exportComponent.dataset.exportComponent}.html`, 'text/html;charset=utf-8'); } catch { notify('读取示例失败，请刷新页面后再试。'); } return; }
  if (event.target.closest('[data-export-favorites]')) download(JSON.stringify({ format: 'ui-design-atlas', version: 1, favorites: [...favorites] }, null, 2), 'design-atlas-favorites.json', 'application/json');
});
document.addEventListener('input', event => { if (event.target.id === 'search') { filter.q = event.target.value; refreshResults(); } });
document.addEventListener('change', async event => {
  if (event.target.id === 'kind-filter') { filter.kind = event.target.value; refreshResults(); }
  if (event.target.id === 'scene-filter') { filter.scene = event.target.value; refreshResults(); }
  if (event.target.id === 'preview-page') { const frame = document.getElementById('case-preview'); const url = `./preview.html?style=${frame.dataset.style}&page=${event.target.value}`; frame.src = url; document.getElementById('preview-newtab').href = url; }
  if (event.target.id === 'import-favorites') { try { const file = event.target.files[0]; if (!file) return; if (file.size > 100000) throw new Error(); const saved = JSON.parse(await file.text()); if (saved.format !== 'ui-design-atlas' || saved.version !== 1 || !Array.isArray(saved.favorites) || !saved.favorites.every(validFavorite)) throw new Error(); saved.favorites.forEach(id => favorites.add(id)); persistFavorites(); render(); notify('收藏已导入。'); } catch { notify('无法导入，请选择本图鉴导出的有效收藏 JSON。'); } }
});
document.addEventListener('submit', event => { if (event.target.matches('[data-demo-form]')) { event.preventDefault(); event.target.querySelector('.s-feedback').textContent = '演示订阅成功，未发送真实邮件。'; } });
document.addEventListener('close', event => { if (event.target.matches('.s-dialog') && event.target.returnValue === 'confirm') notify('已完成演示确认。收藏设计可使用页面上的书签按钮。'); }, true);
document.getElementById('menu-toggle').addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); document.getElementById('menu-toggle').setAttribute('aria-expanded', String(open)); });
document.getElementById('sidebar-close').addEventListener('click', () => { closeMenu(); document.getElementById('menu-toggle').focus(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.querySelector('dialog[open]')) { const search = document.getElementById('search'); if (search) { event.preventDefault(); search.focus(); } } });
document.getElementById('fallback-close').addEventListener('click', () => document.getElementById('copy-fallback').close());
window.addEventListener('hashchange', () => { render(); main.focus({ preventScroll: true }); });
window.addEventListener('storage', event => { if (event.key === 'design-atlas-favorites') { try { const list = JSON.parse(event.newValue || '[]'); if (Array.isArray(list)) { favorites = new Set(list.filter(validFavorite)); render(); } } catch { /* 忽略损坏的外部存储 */ } } });
render();
