// @ts-check
import { escapeHTML as esc } from "./html.js";
/** @param {string} text */
const inline = (text) =>
  esc(text).replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label, url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`,
  );
/** Deliberately limited Markdown: raw HTML stays text. @param {string} text */
export function renderGuidanceMarkdown(text) {
  let html = "",
    code = false,
    lines = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("```")) {
      if (code) {
        html += `<pre><code>${esc(lines.join("\n"))}</code></pre>`;
        lines = [];
      }
      code = !code;
      continue;
    }
    if (code) {
      lines.push(line);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(6, heading[1].length + 1);
      html += `<h${level}>${inline(heading[2])}</h${level}>`;
    } else if (/^[-*] /.test(line))
      html += `<p class="markdown-item">• ${inline(line.slice(2))}</p>`;
    else if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  if (code) html += `<pre><code>${esc(lines.join("\n"))}</code></pre>`;
  return html;
}
