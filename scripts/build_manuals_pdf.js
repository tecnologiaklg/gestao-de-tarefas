// scripts/build_manuals_pdf.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent = [];
  let inTable = false;
  let tableRows = [];
  let inList = false;
  let pendingAnchorId = null;

  function closeList() {
    if (inList) {
      html += '</ul>\n';
      inList = false;
    }
  }

  function closeTable() {
    if (inTable) {
      html += '<table class="corporate-table">\n';
      tableRows.forEach((row, rowIndex) => {
        if (rowIndex === 0) {
          html += '<thead><tr>' + row.map(c => `<th>${c}</th>`).join('') + '</tr></thead>\n<tbody>\n';
        } else {
          html += '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>\n';
        }
      });
      html += '</tbody></table>\n';
      inTable = false;
      tableRows = [];
    }
  }

  function processInline(text) {
    // Links: [Text](#anchor) or [Text](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Bold: **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    return text;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        closeList();
        closeTable();
        html += `<pre class="code-block language-${codeBlockLang}"><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>\n`;
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockContent = [];
      } else {
        closeList();
        closeTable();
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
        codeBlockContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // Anchor tags: <a id="..."></a>
    const anchorMatch = trimmed.match(/^<a\s+id="([^"]+)"><\/a>$/);
    if (anchorMatch) {
      closeList();
      closeTable();
      pendingAnchorId = anchorMatch[1];
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***') {
      closeList();
      closeTable();
      html += '<hr />\n';
      continue;
    }

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeList();
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => processInline(c.trim()));
      // Check if it's separator row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        // separator row, ignore
      } else {
        inTable = true;
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      closeTable();
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      closeList();
      closeTable();
      const headingText = trimmed.slice(2);
      const idAttr = pendingAnchorId ? ` id="${pendingAnchorId}"` : '';
      const anchorDiv = pendingAnchorId ? `<div id="${pendingAnchorId}" class="anchor-target"></div>\n` : '';
      pendingAnchorId = null;
      html += `${anchorDiv}<h1${idAttr}>${processInline(headingText)}</h1>\n`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeList();
      closeTable();
      const headingText = trimmed.slice(3);
      const idAttr = pendingAnchorId ? ` id="${pendingAnchorId}"` : '';
      const anchorDiv = pendingAnchorId ? `<div id="${pendingAnchorId}" class="anchor-target"></div>\n` : '';
      pendingAnchorId = null;
      html += `${anchorDiv}<h2${idAttr}>${processInline(headingText)}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      closeList();
      closeTable();
      const headingText = trimmed.slice(4);
      const idAttr = pendingAnchorId ? ` id="${pendingAnchorId}"` : '';
      const anchorDiv = pendingAnchorId ? `<div id="${pendingAnchorId}" class="anchor-target"></div>\n` : '';
      pendingAnchorId = null;
      html += `${anchorDiv}<h3${idAttr}>${processInline(headingText)}</h3>\n`;
      continue;
    }

    // Callout blockquotes: > [!NOTE] or > **R**: or >
    if (trimmed.startsWith('>')) {
      closeList();
      closeTable();
      const bqContent = trimmed.replace(/^>\s?/, '');
      html += `<blockquote class="callout"><p>${processInline(bqContent)}</p></blockquote>\n`;
      continue;
    }

    // Lists (numbered or bulleted)
    const listMatch = rawLine.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      closeTable();
      const indent = listMatch[1].length;
      const content = processInline(listMatch[3]);
      if (!inList) {
        html += '<ul class="doc-list">\n';
        inList = true;
      }
      const itemClass = indent > 0 ? 'sub-item' : 'main-item';
      html += `<li class="${itemClass}">${content}</li>\n`;
      continue;
    } else if (inList && trimmed === '') {
      // allow empty lines between list items or close on next non-list
    } else if (inList) {
      closeList();
    }

    // Empty lines
    if (trimmed === '') {
      continue;
    }

    // Regular paragraphs
    closeList();
    closeTable();
    if (pendingAnchorId) {
      html += `<div id="${pendingAnchorId}" class="anchor-target"></div>\n`;
      pendingAnchorId = null;
    }
    html += `<p>${processInline(trimmed)}</p>\n`;
  }

  closeList();
  closeTable();
  return html;
}

function generateCompleteHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: A4;
    margin: 18mm 14mm;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.6;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }

  .anchor-target {
    position: relative;
    top: -10px;
    height: 1px;
    margin-bottom: -1px;
    visibility: hidden;
  }

  h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 24px;
    margin-bottom: 12px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h2 {
    font-size: 13.5pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h3 {
    font-size: 11pt;
    font-weight: 700;
    color: #334155;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
  }

  p {
    margin: 0 0 8px 0;
  }

  a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  a:hover {
    text-decoration: underline;
    color: #1d4ed8;
  }

  hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 18px 0;
  }

  /* List & Table of contents */
  ul.doc-list {
    list-style: none;
    padding-left: 0;
    margin: 0 0 12px 0;
  }

  ul.doc-list li.main-item {
    margin-bottom: 5px;
    padding-left: 10px;
    border-left: 2px solid #3b82f6;
  }

  ul.doc-list li.sub-item {
    margin-bottom: 3px;
    margin-left: 20px;
    padding-left: 8px;
    border-left: 1.5px solid #cbd5e1;
    font-size: 9.3pt;
  }

  /* Code & Terminal blocks */
  pre.code-block {
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 8.5pt;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    line-height: 1.4;
    margin: 10px 0 14px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  code {
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 8.8pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  pre.code-block code {
    background: transparent;
    color: inherit;
    padding: 0;
    border: none;
  }

  /* Tables */
  table.corporate-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 9.2pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  table.corporate-table th {
    background: #f8fafc;
    color: #1e293b;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    border-bottom: 2px solid #94a3b8;
  }

  table.corporate-table td {
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    vertical-align: middle;
  }

  table.corporate-table tr:nth-child(even) {
    background: #f8fafc;
  }

  /* Callout blockquotes */
  blockquote.callout {
    border-left: 4px solid #3b82f6;
    background: #eff6ff;
    color: #1e3a8a;
    margin: 10px 0 14px 0;
    padding: 8px 12px;
    border-radius: 0 6px 6px 0;
    font-size: 9.3pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  blockquote.callout p {
    margin: 0;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserPath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const docs = [
    { md: 'manual_colaborador.md', pdf: 'manual_colaborador.pdf', title: 'Manual do Usuário - Portal de Gestão de Tarefas' },
    { md: 'manual_root.md', pdf: 'manual_root.pdf', title: 'Manual do Administrador (Root) - Portal de Gestão de Tarefas' },
  ];

  for (const doc of docs) {
    const mdPath = path.join(rootDir, doc.md);
    const pdfPath = path.join(rootDir, doc.pdf);
    const tempHtmlPath = path.join(rootDir, doc.md.replace('.md', '.temp.html'));

    console.log(`Compilando ${doc.md} -> ${doc.pdf}...`);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const bodyHtml = markdownToHtml(mdContent);
    const fullHtml = generateCompleteHtml(doc.title, bodyHtml);

    fs.writeFileSync(tempHtmlPath, fullHtml, 'utf8');

    const cmd = `"${browserPath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${tempHtmlPath}"`;
    execSync(cmd);

    // Clean up temporary HTML
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }

    const stats = fs.statSync(pdfPath);
    console.log(`✅ ${doc.pdf} gerado com sucesso (${stats.size} bytes)!`);
  }
}

main();
