'use strict';

const brand = require('./brand');
const tables = require('./tables');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function layout({ title, description, path, extraHead = '', body }) {
  const url = `${brand.siteUrl()}${path}`;
  const fullTitle = path === '/' ? `${brand.NAME} — ${brand.TAGLINE}` : `${title} · ${brand.NAME}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="theme-color" content="#f3eee4">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:type" content="website">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650;9..144,700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/site.css">
  ${extraHead}
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <div class="sheet">
    <header class="mast">
      <p class="mast-kicker">Compiled tables · no ads on fact URLs</p>
      <a class="wordmark" href="/">${esc(brand.NAME)}</a>
      <p class="mast-tag">${esc(brand.TAGLINE)}</p>
      <nav class="nav" aria-label="Primary">
        <a href="/">Tables</a>
        <a href="/method">Method</a>
        <a href="/privacy">Privacy</a>
        <a href="/#money">Money</a>
        <a href="/#local">Local</a>
        <a href="/#jobsite">Jobsite</a>
      </nav>
    </header>
    <main id="main">${body}</main>
    <footer class="colophon">
      <p>Compiled by ${esc(brand.COMPILER)}. ${esc(brand.DISCLAIMER)}</p>
      <p>Certification exam prep lives on <a href="https://passlat.com">PassLat</a>. This site is the rest: money, local rules, and work in the field.</p>
      <p><a href="/privacy">Privacy</a> · <a href="/method">Method</a> · MFG National Holdings LLC</p>
    </footer>
  </div>
</body>
</html>`;
}

function renderBlock(block) {
  const head = block.columns
    .map((c) => `<th${c.format === 'usd' ? ' class="num"' : ''}>${esc(c.label)}</th>`)
    .join('');
  const body = block.rows
    .map((row) => {
      const tds = block.columns
        .map((c) => {
          const cls = c.format === 'usd' ? ' class="num"' : '';
          return `<td${cls}>${esc(tables.formatCell(row[c.key], c.format))}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');
  return `<figure class="ledger">
    <figcaption>${esc(block.caption)}</figcaption>
    <div class="scroll">
      <table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  </figure>`;
}

function homePage() {
  const live = tables.loadAll();
  const clusters = tables.CLUSTERS.map((c) => {
    const liveRows = tables.liveInCluster(c.id);
    const queued = tables.queuedInCluster(c.id);
    const liveLis = liveRows
      .map(
        (t) =>
          `<li><a href="/tables/${esc(t.slug)}"><strong>${esc(t.title)}</strong><span>As of ${esc(t.asOf)}</span></a></li>`,
      )
      .join('');
    const queuedLis = queued
      .map((t) => `<li class="queued"><span>${esc(t.title)}</span><em>Queued — no empty shell</em></li>`)
      .join('');
    return `<section class="cluster" id="${esc(c.id)}">
      <header>
        <h2>${esc(c.label)}</h2>
        <p>${esc(c.dek)}</p>
      </header>
      <ol class="stack">${liveLis}${queuedLis}</ol>
    </section>`;
  }).join('');

  const featured = live.find((t) => t.slug === '401k-limits-2026') || live[0];
  const extraHead = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.NAME,
    url: brand.siteUrl(),
    description: brand.TAGLINE,
    publisher: { '@type': 'Person', name: brand.COMPILER },
  });

  const body = `
    <section class="hero">
      <p class="stamp">Gazette of numbers</p>
      <h1>One table.<br>Official sources.<br>An as-of date.</h1>
      <p class="lede">We compile what the .gov PDF already said — joined, dated, and downloadable as HTML, JSON, and Markdown. No essays. No ads on the fact URL.</p>
    </section>
    <section class="feature">
      <p class="eyebrow">Featured · tax year ${esc(String(featured.taxYear))}</p>
      <h2><a href="/tables/${esc(featured.slug)}">${esc(featured.title)}</a></h2>
      <p>${esc(featured.extract.slice(0, 280))}…</p>
      <p class="file-row">
        <a class="chip" href="/tables/${esc(featured.slug)}">Open table</a>
        <a class="chip" href="/tables/${esc(featured.slug)}.json">JSON</a>
        <a class="chip" href="/tables/${esc(featured.slug)}.md">Markdown</a>
      </p>
    </section>
    ${clusters}
  `;
  return layout({
    title: brand.NAME,
    description: brand.TAGLINE,
    path: '/',
    extraHead,
    body,
  });
}

function methodPage() {
  const body = `
    <article class="prose">
      <p class="stamp">How a page earns a URL</p>
      <h1>Method</h1>
      <p>A Cite Hubs page exists only when it does work the official site does not: a 50-state join, a county PDF compilation, or two IRS notices on one table with an as-of date. If a cell has one official URL and no join, we link out and skip the page.</p>
      <h2>Page contract</h2>
      <ul>
        <li>Title is the query. The first 80–120 words are the answer.</li>
        <li>One primary table. Rows are cases, not paragraphs.</li>
        <li>Every compilation names ${esc(brand.COMPILER)}, the as-of date, and the outbound .gov / code-year sources.</li>
        <li>The same numbers ship as <code>/x.json</code> and <code>/x.md</code>.</li>
        <li>No ads, no affiliates, no exam-prep quizzes. Those belong on PassLat.</li>
        <li><code>lastmod</code> moves only when the data file changes.</li>
      </ul>
      <h2>What this site is not</h2>
      <p>Not NCLEX, TEAS, OSHA-10, CDL, or elevator exam prep. Not Blender notes. Not a trading clock. Not 150 thin URLs.</p>
    </article>
  `;
  return layout({
    title: 'Method',
    description: 'How Cite Hubs compiles tables, what gets a URL, and what stays off this site.',
    path: '/method',
    extraHead: jsonLd({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'Method',
      url: `${brand.siteUrl()}/method`,
    }),
    body,
  });
}

function tablePage(table) {
  const path = `/tables/${table.slug}`;
  const pageUrl = `${brand.siteUrl()}${path}`;
  const blocks = table.tables.map(renderBlock).join('');
  const sources = table.sources
    .map((s) => `<li><a href="${esc(s.url)}">${esc(s.title)}</a></li>`)
    .join('');
  const extraHead = [
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: table.title,
      description: table.description,
      url: pageUrl,
      dateModified: table.asOf,
      creator: {
        '@type': 'Person',
        name: brand.COMPILER,
        affiliation: { '@type': 'Organization', name: brand.NAME, url: brand.siteUrl() },
      },
      isBasedOn: table.sources.map((s) => s.url),
      distribution: [
        { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${pageUrl}.json` },
        { '@type': 'DataDownload', encodingFormat: 'text/markdown', contentUrl: `${pageUrl}.md` },
      ],
    }),
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: table.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    }),
  ].join('\n');

  const body = `
    <article class="table-page">
      <p class="stamp">${esc(table.cluster)} · tax year ${esc(String(table.taxYear))} · as of ${esc(table.asOf)}</p>
      <h1>${esc(table.title)}</h1>
      <p class="extract">${esc(table.extract)}</p>
      <p class="file-row">
        Same numbers:
        <a class="chip" href="${esc(path)}.json">JSON</a>
        <a class="chip" href="${esc(path)}.md">Markdown</a>
      </p>
      ${blocks}
      <section class="sources">
        <h2>Sources</h2>
        <ul>${sources}</ul>
        <p class="fine">${esc(brand.DISCLAIMER)} Compiled by ${esc(brand.COMPILER)} for ${esc(brand.NAME)}.</p>
      </section>
    </article>
  `;
  return layout({
    title: table.title,
    description: table.description,
    path,
    extraHead,
    body,
  });
}

function privacyPage() {
  const body = `
    <article class="prose">
      <p class="stamp">Legal</p>
      <h1>Privacy</h1>
      <p>Cite Hubs is operated by MFG National Holdings LLC, 16 Norton Ln, Arden, NC 28704. The public pages are static compilations. We do not run ads on fact URLs and we do not sell table contents to data brokers.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Standard web logs on the host (Railway) and CDN (Cloudflare when a custom domain is proxied): IP, user-agent, path, status, timestamp.</li>
        <li>No accounts, no cookies for advertising, no newsletter form on this site as of 29 August 2026.</li>
      </ul>
      <h2>What we do not collect</h2>
      <p>We do not ask for Social Security numbers, tax returns, or client files. The tables are public IRS and code-year figures, not your numbers.</p>
      <h2>Contact</h2>
      <p>Privacy requests: <a href="mailto:contact@mfgnationalholdings.com">contact@mfgnationalholdings.com</a>. Related brands: <a href="https://mfgnationalholdings.com">mfgnationalholdings.com</a>.</p>
    </article>
  `;
  return layout({
    title: 'Privacy',
    description: 'What Cite Hubs collects: host logs only. No ads on fact URLs. MFG National Holdings LLC.',
    path: '/privacy',
    extraHead: jsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Privacy',
      url: `${brand.siteUrl()}/privacy`,
    }),
    body,
  });
}

function notFound() {
  return layout({
    title: 'Not found',
    description: 'No table at this URL.',
    path: '/404',
    body: `<article class="prose"><h1>No table here</h1><p>We do not ship empty shells. <a href="/">Back to the gazette</a>.</p></article>`,
  });
}

module.exports = { homePage, methodPage, privacyPage, tablePage, notFound };
