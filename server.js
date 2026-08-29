'use strict';

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const brand = require('./lib/brand');
const tables = require('./lib/tables');
const html = require('./lib/html');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

const PORT = process.env.PORT || 8080;

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '7d',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.css') || filePath.endsWith('.svg')) {
        res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      }
    },
  }),
);

app.get('/health', (_req, res) => {
  res.status(200).type('text').send('ok');
});

app.get('/', (_req, res) => {
  res.type('html').send(html.homePage());
});

app.get('/method', (_req, res) => {
  res.type('html').send(html.methodPage());
});

app.get('/robots.txt', (_req, res) => {
  const origin = brand.siteUrl();
  res
    .type('text/plain')
    .send(
      `User-agent: *\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=no, use=reference\nSitemap: ${origin}/sitemap.xml\n`,
    );
});

app.get('/sitemap.xml', (_req, res) => {
  const origin = brand.siteUrl();
  const urls = [
    { loc: `${origin}/`, lastmod: '2026-08-29' },
    { loc: `${origin}/method`, lastmod: '2026-08-29' },
    ...tables.loadAll().map((t) => ({
      loc: `${origin}/tables/${t.slug}`,
      lastmod: t.asOf,
    })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`,
  )
  .join('\n')}
</urlset>
`;
  res.type('application/xml').send(body);
});

app.get('/llms.txt', (_req, res) => {
  const origin = brand.siteUrl();
  const lines = [
    `# ${brand.NAME}`,
    '',
    `> ${brand.TAGLINE} Compilations of official sources, not advice. Not exam prep.`,
    '',
    '## Cite tables',
    '',
  ];
  for (const t of tables.loadAll()) {
    lines.push(`- [${t.title}](${origin}/tables/${t.slug}): as of ${t.asOf}`);
    lines.push(`- JSON: ${origin}/tables/${t.slug}.json`);
    lines.push(`- Markdown: ${origin}/tables/${t.slug}.md`);
  }
  lines.push('', '## Site', '', `- [Home](${origin}/)`, `- [Method](${origin}/method)`, '');
  res.type('text/plain; charset=utf-8').send(lines.join('\n'));
});

app.get('/tables/:slug.json', (req, res) => {
  const table = tables.bySlug(req.params.slug);
  if (!table) return res.status(404).json({ error: 'not found' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(tables.toJson(table));
});

app.get('/tables/:slug.md', (req, res) => {
  const table = tables.bySlug(req.params.slug);
  if (!table) return res.status(404).type('text').send('not found');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.type('text/markdown; charset=utf-8').send(tables.toMarkdown(table));
});

app.get('/tables/:slug', (req, res) => {
  const table = tables.bySlug(req.params.slug);
  if (!table) return res.status(404).type('html').send(html.notFound());
  res.type('html').send(html.tablePage(table));
});

app.use((_req, res) => {
  res.status(404).type('html').send(html.notFound());
});

app.listen(PORT, () => {
  console.log(`${brand.NAME} listening on ${PORT}`);
});
